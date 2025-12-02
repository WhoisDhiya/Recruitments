const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');


// Routes pour les candidats

// IMPORTANT: Les routes spécifiques doivent être AVANT les routes avec paramètres dynamiques

// Récupérer tous les candidats (pour admin)
router.get('/', candidateController.getAllCandidates);

// Récupérer le profil d'un candidat par user_id (AVANT /profile/:candidateId)
router.get('/profile/user/:userId', candidateController.getProfileByUserId);

// Récupérer le profil d'un candidat par ID
router.get('/profile/:candidateId', candidateController.getProfile);

// Mettre à jour le profil candidat
router.put('/profile/:candidateId', candidateController.updateProfile);

// Récupérer les candidatures d'un candidat
router.get('/:candidateId/applications', candidateController.getApplications);

// Route spéciale pour le recruteur (Celle qui déclenche le paiement/crédit)
router.get('/recruiter-view/:id', candidateController.getCandidateDetailsForRecruiter);

module.exports = router;
