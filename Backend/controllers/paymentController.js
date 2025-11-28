// controllers/paymentController.js
const db = require("../config/database");
const Pack = require("../models/Pack"); // Utilisons tes modèles !
const Payment = require("../models/Payment");
const RecruiterSubscription = require("../models/RecruiterSubscription");

// If payments are disabled via env, handlers will return 503 with a friendly message
const paymentsDisabled = process.env.DISABLE_PAYMENTS === 'true';
let stripe = null;
if (!paymentsDisabled) {
    try {
        stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    } catch (err) {
        console.warn('Stripe init failed in paymentController:', err && err.message ? err.message : err);
        stripe = null;
    }
}

exports.createCheckoutSession = async (req, res) => {
    if (paymentsDisabled) {
        return res.status(503).json({ status: 'UNAVAILABLE', message: 'Payments are temporarily disabled' });
    }
    try {
        const { recruiter_id, pack_id } = req.body;

        // 1. Utiliser ton modèle Pack pour récupérer les infos
        const pack = await Pack.findById(pack_id);

        if (!pack) {
            return res.status(400).json({ message: "Pack introuvable" });
        }

        if (!stripe) {
            return res.status(500).json({ message: 'Stripe is not configured on the server' });
        }

        // 2. Créer la session Stripe avec METADATA
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: { 
                            name: `Pack ${pack.name}`,
                            description: pack.description
                        },
                        unit_amount: Math.round(pack.price * 100), // Conversion en cents
                    },
                    quantity: 1,
                },
            ],
            // IMPORTANT : On passe les IDs ici pour les récupérer après le paiement
            metadata: {
                recruiter_id: recruiter_id,
                pack_id: pack_id
            },
            success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
        });

        return res.json({ url: session.url });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erreur Stripe", error: error.message });
    }
};

exports.handlePaymentSuccess = async (req, res) => {
    if (paymentsDisabled) {
        return res.status(503).json({ status: 'UNAVAILABLE', message: 'Payments are temporarily disabled' });
    }
    try {
        const { session_id } = req.body; // Ou req.query selon comment tu appelles cette route

        if (!session_id) {
            return res.status(400).json({ message: "Session ID manquant" });
        }

        if (!stripe) {
            return res.status(500).json({ message: 'Stripe is not configured on the server' });
        }

        // 1. Vérifier la session auprès de Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status !== 'paid') {
            return res.status(400).json({ message: "Le paiement n'a pas été validé." });
        }

        // 2. Récupérer les infos depuis les metadata
        const { recruiter_id, pack_id } = session.metadata;
        
        // Vérifier si ce paiement a déjà été traité (via transaction_id) pour éviter les doublons
        const existingPayment = await Payment.findByTransactionId(session.payment_intent);
        if (existingPayment) {
            return res.json({ message: "Paiement déjà enregistré", subscription: await RecruiterSubscription.checkActive(recruiter_id) });
        }

        // 3. Récupérer les détails du pack pour calculer la date de fin
        const pack = await Pack.findById(pack_id);
        
        // Calcul de la date de fin (Date actuelle + visibility_days du pack)
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + pack.visibility_days);

        // 4. Enregistrer le paiement dans la DB
        // Note: offer_id est null car c'est un achat de Pack global
        await Payment.create({
            recruiter_id: recruiter_id,
            offer_id: null, 
            amount: session.amount_total / 100, // Remettre en dollars/euros
            payment_method: "stripe",
            transaction_id: session.payment_intent, // ID unique de transaction Stripe
            status: "completed"
        });

        // 5. Créer l'abonnement (Subscription)
        const subscriptionId = await RecruiterSubscription.create({
            recruiter_id: recruiter_id,
            pack_id: pack_id,
            start_date: startDate,
            end_date: endDate,
            status: 'active'
        });

        return res.status(200).json({ 
            success: true, 
            message: "Paiement réussi et abonnement activé !",
            subscriptionId: subscriptionId
        });

    } catch (error) {
        console.error("Erreur validation paiement:", error);
        res.status(500).json({ message: "Erreur lors de la validation du paiement", error: error.message });
    }
};