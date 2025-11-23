const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// Récupérer toutes les notifications de l'utilisateur connecté
router.get('/', auth, notificationController.getAll);

// Récupérer uniquement les notifications non lues
router.get('/unread', auth, notificationController.getUnread);

// Compter les notifications non lues
router.get('/unread/count', auth, notificationController.getUnreadCount);

// Marquer une notification comme lue
router.put('/:id/read', auth, notificationController.markAsRead);

// Marquer toutes les notifications comme lues
router.put('/read-all', auth, notificationController.markAllAsRead);

// Supprimer une notification
router.delete('/:id', auth, notificationController.delete);

module.exports = router;


