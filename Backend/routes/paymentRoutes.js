const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Route pour récupérer tous les packs disponibles
router.get('/packs', paymentController.getPacks);

// Route pour vérifier l'abonnement actif d'un recruteur
router.get('/subscription/:recruiter_id', paymentController.checkActiveSubscription);

// Route pour initier le paiement (Redirige vers Stripe)
router.post('/create-checkout-session', paymentController.createCheckoutSession);

// Create a pending recruiter record (store hashed password) before checkout
router.post('/pending-recruiters', paymentController.createPendingRecruiter);

// Route appelée par ton Frontend une fois que l'utilisateur revient de Stripe
// Le frontend enverra le session_id récupéré dans l'URL
router.post('/payment-success', paymentController.handlePaymentSuccess);

// Route GET pour rediriger vers le frontend si quelqu'un accède directement au backend
router.get('/payment-success', (req, res) => {
    const sessionId = req.query.session_id;
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    if (sessionId) {
        res.redirect(`${frontendUrl}/payment-success?session_id=${sessionId}`);
    } else {
        res.redirect(`${frontendUrl}/payment-success`);
    }
});

module.exports = router;