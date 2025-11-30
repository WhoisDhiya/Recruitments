const express = require('express');
const router = express.Router();
const savedJobController = require('../controllers/savedJobController');
const auth = require('../middleware/auth'); // Middleware JWT

// Toutes les routes nécessitent une authentification
router.use(auth);

// Sauvegarder une offre
router.post('/', savedJobController.saveJob);

// Retirer une offre sauvegardée
router.delete('/:offer_id', savedJobController.unsaveJob);

// Récupérer toutes les offres sauvegardées du candidat connecté
router.get('/', savedJobController.getSavedJobs);

// Récupérer les IDs des offres sauvegardées (pour vérification rapide)
router.get('/ids', savedJobController.getSavedJobIds);

module.exports = router;

