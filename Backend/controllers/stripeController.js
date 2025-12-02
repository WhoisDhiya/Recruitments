const Stripe = require("stripe");
const db = require("../config/database");

const hasStripeKey = !!process.env.STRIPE_SECRET_KEY;
const paymentsDisabled = process.env.DISABLE_PAYMENTS === 'true' || !hasStripeKey;

const stripe = !paymentsDisabled && hasStripeKey
    ? Stripe(process.env.STRIPE_SECRET_KEY)
    : null;

/**
 * Create a Stripe checkout session
 * Accepts pending_id, recruiter_id, or recruiter_payload in metadata
 */
exports.createCheckoutSession = async (req, res) => {
    if (paymentsDisabled || !stripe) {
        return res.status(503).json({
            status: 'UNAVAILABLE',
            message: 'Payments are temporarily disabled or Stripe is not configured'
        });
    }

    try {
        const { recruiter_id, pack_id, pending_id, recruiter_payload } = req.body;

        // Récupérer le pack dans la base
        const [rows] = await db.query("SELECT * FROM packs WHERE id = ?", [pack_id]);
        const pack = rows[0];

        if (!pack) {
            return res.status(400).json({ message: "Pack introuvable" });
        }

        // Build metadata for later retrieval after payment
        const metadata = {
            pack_id: String(pack_id),
            ...(recruiter_id && { recruiter_id: String(recruiter_id) }),
            ...(pending_id && { pending_id: String(pending_id) }),
            ...(recruiter_payload && { recruiter_payload: JSON.stringify(recruiter_payload) })
        };

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
                        unit_amount: Math.round(pack.price * 100), // Stripe utilise les cents
                    },
                    quantity: 1,
                },
            ],
            metadata,
            success_url: `http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:3000/payment-cancel`,
        });

        return res.json({ url: session.url });

    } catch (error) {
        console.error('Stripe createCheckoutSession error:', error);
        res.status(500).json({ 
            message: "Erreur lors de la création de la session Stripe", 
            error: error.message 
        });
    }
};

/**
 * Retrieve a Stripe checkout session (used by payment verification)
 */
exports.retrieveCheckoutSession = async (sessionId) => {
    if (!stripe) {
        throw new Error('Stripe is not configured');
    }
    return await stripe.checkout.sessions.retrieve(sessionId);
};
