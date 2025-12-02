const express = require('express');
const router = express.Router();
const recruiterController = require('../controllers/recruiterController');

// Routes pour les recruteurs

// IMPORTANT: Les routes spécifiques doivent être AVANT les routes avec paramètres dynamiques

// Récupérer tous les recruteurs (pour admin)
router.get('/', recruiterController.getAllRecruiters);

// Récupérer le profil d'un recruteur par user_id (AVANT /:id)
router.get('/user/:userId', recruiterController.getRecruiterByUserId);

// Récupérer le profil d'un recruteur par ID
router.get('/:id', recruiterController.getRecruiterById);

// Mettre à jour le profil recruteur
router.put('/:id', recruiterController.updateRecruiter);

// Récupérer les offres d'un recruteur
router.get('/:id/offers', recruiterController.getRecruiterOffers);

module.exports = router;
