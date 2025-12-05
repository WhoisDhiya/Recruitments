// controllers/paymentController.js
const db = require("../config/database");
const Pack = require("../models/Pack");
const Payment = require("../models/Payment");
const RecruiterSubscription = require("../models/RecruiterSubscription");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require("../models/User");
const Recruiter = require("../models/Recruiter");
const PendingRecruiter = require("../models/PendingRecruiter");
const stripeController = require("./stripeController");

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET || 'ma_clé_secrète_ultra_sécurisée';

// If payments are disabled via env, handlers will return 503 with a friendly message
const hasStripeKey = !!process.env.STRIPE_SECRET_KEY;
const paymentsDisabled = process.env.DISABLE_PAYMENTS === 'true' || !hasStripeKey;

// Récupérer tous les packs disponibles
// Cette route est toujours disponible, même si les paiements sont désactivés
exports.getPacks = async (req, res) => {
    try {
        const packs = await Pack.findAll();
        
        if (!packs || packs.length === 0) {
            return res.status(200).json({
                status: 'SUCCESS',
                data: [],
                message: 'No packs available. Please contact administrator to add packs.'
            });
        }
        
        res.status(200).json({
            status: 'SUCCESS',
            data: packs
        });
    } catch (error) {
        console.error('Erreur récupération packs:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur lors de la récupération des packs',
            error: error.message
        });
    }
};

// Vérifier si un recruteur a un abonnement actif
exports.checkActiveSubscription = async (req, res) => {
    try {
        const { recruiter_id } = req.params;
        
        if (!recruiter_id) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'recruiter_id est requis'
            });
        }

        // ✅ La vérification se fait dans checkActive() avec NOW() côté SQL
        // Pas besoin de vérifier côté Node.js, la requête SQL le fait déjà
        const subscription = await RecruiterSubscription.checkActive(parseInt(recruiter_id));
        
        if (subscription) {
            return res.status(200).json({
                status: 'SUCCESS',
                hasActiveSubscription: true,
                data: subscription
            });
        }

        return res.status(200).json({
            status: 'SUCCESS',
            hasActiveSubscription: false,
            message: 'Aucun abonnement actif trouvé'
        });
    } catch (error) {
        console.error('Erreur vérification abonnement:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur lors de la vérification de l\'abonnement',
            error: error.message
        });
    }
};

exports.createCheckoutSession = async (req, res) => {
    if (paymentsDisabled) {
        const reason = !hasStripeKey ? 'Stripe is not configured (STRIPE_SECRET_KEY missing)' : 'Payments are disabled';
        console.error('❌ Payment attempt blocked:', reason);
        return res.status(503).json({ 
            status: 'UNAVAILABLE', 
            message: `Les paiements ne sont pas activés. ${reason}. Veuillez configurer Stripe ou contacter l'administrateur.` 
        });
    }
    try {
        const { recruiter_id, pack_id, recruiter_payload, pending_id } = req.body;

        // Validate pack exists
        const pack = await Pack.findById(pack_id);
        if (!pack) {
            return res.status(400).json({ message: "Pack introuvable" });
        }

        // If frontend provided a recruiter_payload directly (fallback), create a pending record first
        let usedPendingId = pending_id || null;
        if (!usedPendingId && recruiter_payload) {
            try {
                const hashed = recruiter_payload.password ? await bcrypt.hash(String(recruiter_payload.password), 10) : '';
                const pendingData = {
                    last_name: recruiter_payload.last_name,
                    first_name: recruiter_payload.first_name,
                    email: recruiter_payload.email,
                    hashed_password: hashed,
                    role: recruiter_payload.role || 'recruiter',
                    company_name: recruiter_payload.company_name,
                    industry: recruiter_payload.industry,
                    description: recruiter_payload.description,
                    company_email: recruiter_payload.company_email,
                    company_address: recruiter_payload.company_address
                };
                usedPendingId = await PendingRecruiter.create(pendingData);
            } catch (err) {
                console.error('Failed to create pending recruiter:', err && err.message ? err.message : err);
                return res.status(500).json({ message: 'Erreur création pending recruiter', error: err.message });
            }
        }

        // Delegate to stripeController to create the checkout session
        const stripeReq = {
            body: {
                recruiter_id,
                pack_id,
                pending_id: usedPendingId,
                recruiter_payload: recruiter_payload || undefined
            }
        };
        const stripeRes = {
            status: (code) => stripeRes,
            json: (data) => {
                res.status(200).json(data);
            }
        };
        return await stripeController.createCheckoutSession(stripeReq, stripeRes);

    } catch (error) {
        console.error('Payment createCheckoutSession error:', error);
        res.status(500).json({ message: "Erreur lors de la création de la session de paiement", error: error.message });
    }
};

exports.handlePaymentSuccess = async (req, res) => {
    if (paymentsDisabled) {
        return res.status(503).json({ status: 'UNAVAILABLE', message: 'Payments are temporarily disabled' });
    }
    try {
        const { session_id } = req.body;

        if (!session_id) {
            return res.status(400).json({ message: "Session ID manquant" });
        }

        if (paymentsDisabled) {
            return res.status(503).json({ message: 'Payments are temporarily disabled' });
        }

        // 1. Retrieve the session from Stripe using stripeController
        let session;
        try {
            session = await stripeController.retrieveCheckoutSession(session_id);
        } catch (err) {
            console.error('Error retrieving Stripe session:', err);
            return res.status(500).json({ message: 'Stripe is not configured on the server' });
        }

        if (session.payment_status !== 'paid') {
            return res.status(400).json({ message: "Le paiement n'a pas été validé." });
        }

        // 2. Récupérer les infos depuis les metadata
        let { recruiter_id, pack_id, recruiter_payload, pending_id } = session.metadata || {};
        
        console.log('📦 Payment Success - Metadata:', { recruiter_id, pack_id, pending_id, hasPayload: !!recruiter_payload });
        
        // Convert pack_id to number if it's a string
        if (pack_id && typeof pack_id === 'string') {
            pack_id = parseInt(pack_id, 10);
        }
        
        // recruiter_payload may be a JSON string if sent from the frontend
        if (recruiter_payload && typeof recruiter_payload === 'string') {
            try {
                recruiter_payload = JSON.parse(recruiter_payload);
            } catch (err) {
                console.warn('Could not parse recruiter_payload metadata:', err && err.message ? err.message : err);
                recruiter_payload = null;
            }
        }
        
        // 3. If recruiter_id missing but we have pending_id, fetch pending data and create the user + recruiter now
        if (!recruiter_id && pending_id) {
            try {
                console.log('🔄 Creating recruiter from pending_id:', pending_id);
                const pending = await PendingRecruiter.findById(pending_id);
                if (!pending) throw new Error('Pending recruiter not found');

                // Use the stored hashed password
                const { last_name, first_name, email, hashed_password, role, company_name, industry, description, company_email, company_address } = pending;

                // If user exists, reuse it; otherwise create
                let user = await User.findByEmail(email);
                let userId;
                if (user) {
                    console.log('👤 User already exists:', user.id);
                    userId = user.id;
                } else {
                    // Pending hashed_password already stored
                    console.log('➕ Creating new user for:', email);
                    userId = await User.create({ last_name, first_name, email, password: hashed_password, role: role || 'recruiter' });
                    console.log('✅ User created with ID:', userId);
                }

                // Ensure recruiter profile exists
                let recruiter = await Recruiter.findByUserId(userId);
                if (!recruiter) {
                    console.log('➕ Creating recruiter profile for user:', userId);
                    const recruiterIdCreated = await Recruiter.create({ 
                        user_id: userId, 
                        company_name: company_name || '', 
                        industry: industry || '', 
                        description: description || '', 
                        company_email: company_email || '', 
                        company_address: company_address || '' 
                    });
                    recruiter_id = recruiterIdCreated;
                    console.log('✅ Recruiter created with ID:', recruiter_id);
                } else {
                    recruiter_id = recruiter.id;
                    console.log('👤 Recruiter already exists:', recruiter_id);
                }

                // Remove pending record
                await PendingRecruiter.delete(pending_id);
                console.log('🗑️ Pending recruiter record deleted');
            } catch (err) {
                console.error('❌ Error creating recruiter from pending:', err);
                return res.status(500).json({ message: 'Failed to create recruiter after payment', error: err.message });
            }
        }

        // Vérifier si ce paiement a déjà été traité (via transaction_id) pour éviter les doublons
        // NOTE: Must be AFTER creating recruiter from pending_id if needed
        console.log('🔍 Checking for existing payment with transaction_id:', session.payment_intent);
        const existingPayment = await Payment.findByTransactionId(session.payment_intent);
        if (existingPayment) {
            console.log('⚠️ Payment already processed');
            return res.json({ message: "Paiement déjà enregistré", subscription: recruiter_id ? await RecruiterSubscription.checkActive(recruiter_id) : null });
        }

        // 4. Récupérer les détails du pack pour calculer la date de fin
        console.log('📦 Fetching pack with ID:', pack_id);
        const pack = await Pack.findById(pack_id);
        
        if (!pack) {
            console.error('❌ Pack not found:', pack_id);
            return res.status(400).json({ message: "Pack not found for subscription" });
        }
        
        if (!recruiter_id) {
            console.error('❌ Recruiter ID missing after payment processing');
            return res.status(400).json({ message: "Recruiter ID not found after payment processing" });
        }
        
        console.log('✅ Pack found:', pack.name, '| Recruiter ID:', recruiter_id);
        
        // Calcul de la date de fin (Date actuelle + visibility_days du pack)
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + pack.visibility_days);
        
        console.log('📅 Subscription dates - Start:', startDate, 'End:', endDate);

        // 4. Enregistrer le paiement dans la DB
        // Note: offer_id est null car c'est un achat de Pack global
        console.log('💳 Creating payment record...');
        const paymentAmount = session.amount_total / 100; // Remettre en dollars/euros
        const paymentId = await Payment.create({
            recruiter_id: recruiter_id,
            offer_id: null, 
            amount: paymentAmount,
            payment_method: "stripe",
            transaction_id: session.payment_intent, // ID unique de transaction Stripe
            status: "completed"
        });
        console.log('✅ Payment created with ID:', paymentId, '| Amount:', paymentAmount);

        // 5. Créer l'abonnement (Subscription) dans recruiter_subscriptions
        console.log('📝 Creating subscription in recruiter_subscriptions...');
        const subscriptionId = await RecruiterSubscription.create({
            recruiter_id: recruiter_id,
            pack_id: pack_id,
            start_date: startDate,
            end_date: endDate,
            status: 'active'
        });
        console.log('✅ Subscription created with ID:', subscriptionId, '| Recruiter:', recruiter_id, '| Pack:', pack_id);

        // Fetch recruiter + user info to return a token and user object
        let recruiterInfo = null;
        try {
            recruiterInfo = await Recruiter.findById(recruiter_id);
        } catch (err) {
            console.warn('Could not fetch recruiter info after subscription:', err && err.message ? err.message : err);
        }

        // Create a JWT token so frontend can authenticate the newly created user
        let token = null;
        let userForToken = null;
        if (recruiterInfo && recruiterInfo.user_id) {
            userForToken = {
                id: recruiterInfo.user_id,
                email: recruiterInfo.email,
                role: recruiterInfo.role
            };
            token = jwt.sign({ user_id: userForToken.id, email: userForToken.email, role: userForToken.role }, SECRET_KEY, { expiresIn: '24h' });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Paiement réussi et abonnement activé !",
            subscriptionId: subscriptionId,
            token,
            user: userForToken,
            recruiter: recruiterInfo
        });

    } catch (error) {
        console.error("Erreur validation paiement:", error);
        res.status(500).json({ message: "Erreur lors de la validation du paiement", error: error.message });
    }
};

// Create a pending recruiter record (hash password) - frontend should call this before checkout
exports.createPendingRecruiter = async (req, res) => {
    try {
        const payload = req.body;
        const { last_name, first_name, email, password, role, company_name, industry, description, company_email, company_address } = payload;

        if (!last_name || !first_name || !email || !password) {
            return res.status(400).json({ status: 'ERROR', message: 'Required fields missing' });
        }

        // Validation du format email (structure Gmail/email valide)
        // Doit avoir au moins 2 caractères après le point final (ex: .com, .fr, .org)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ 
                status: 'ERROR', 
                message: 'Format d\'email invalide. Veuillez entrer un email valide (ex: exemple@gmail.com)' 
            });
        }

        // Validation de l'email de l'entreprise si fourni (pour les recruteurs)
        if (company_email && company_email.trim()) {
            if (!emailRegex.test(company_email.trim())) {
                return res.status(400).json({ 
                    status: 'ERROR', 
                    message: 'Format d\'email de l\'entreprise invalide. Veuillez entrer un email valide (ex: contact@company.com)' 
                });
            }
        }

        // Validation du mot de passe
        // Au moins 8 caractères, une majuscule, une minuscule, un chiffre
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ 
                status: 'ERROR', 
                message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre' 
            });
        }

        // Normaliser l'email (trim et lowercase pour éviter les doublons)
        const normalizedEmail = email.trim().toLowerCase();
        
        // Vérifier si l'email existe déjà dans users
        const User = require('../models/User');
        const existingUser = await User.findByEmail(normalizedEmail);
        if (existingUser) {
            return res.status(409).json({ 
                status: 'ERROR', 
                message: 'Cet email est déjà utilisé' 
            });
        }

        // Hash the password before storing
        const hashed = await bcrypt.hash(String(password), 10);

        const pendingId = await PendingRecruiter.create({
            last_name,
            first_name,
            email: normalizedEmail,
            hashed_password: hashed,
            role: role || 'recruiter',
            company_name,
            industry,
            description,
            company_email: company_email ? company_email.trim().toLowerCase() : company_email,
            company_address
        });

        return res.status(201).json({ status: 'SUCCESS', pending_id: pendingId });
    } catch (err) {
        console.error('Error creating pending recruiter:', err);
        
        // Gérer spécifiquement les erreurs de duplication d'email
        if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
            return res.status(409).json({ 
                status: 'ERROR', 
                message: 'Cet email est déjà utilisé' 
            });
        }
        
        res.status(500).json({ status: 'ERROR', message: 'Failed to create pending recruiter', error: err.message });
    }
};