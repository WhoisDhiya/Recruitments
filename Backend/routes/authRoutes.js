const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Route d'inscription
router.post('/signup', authController.signup);

// Route de connexion
router.post('/login', authController.login);

// Logout (route protégée pour exemple)
router.post('/logout', authMiddleware, authController.logout);

// Mettre à jour le profil utilisateur
router.put('/users/:userId/profile', authMiddleware, authController.updateUserProfile);

module.exports = router;

