const Notification = require('../models/Notification');

// Récupérer toutes les notifications de l'utilisateur connecté
exports.getAll = async (req, res) => {
    try {
        const userId = req.user.user_id; // Depuis le middleware auth
        
        const notifications = await Notification.findByUserId(userId);
        
        res.status(200).json({
            status: 'SUCCESS',
            message: 'Notifications récupérées avec succès',
            data: notifications
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des notifications:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur lors de la récupération des notifications',
            error: error.message
        });
    }
};

// Récupérer uniquement les notifications non lues
exports.getUnread = async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        const notifications = await Notification.findUnreadByUserId(userId);
        
        res.status(200).json({
            status: 'SUCCESS',
            message: 'Notifications non lues récupérées avec succès',
            data: notifications
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des notifications non lues:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur lors de la récupération des notifications non lues',
            error: error.message
        });
    }
};

// Compter les notifications non lues
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        const count = await Notification.countUnread(userId);
        
        res.status(200).json({
            status: 'SUCCESS',
            message: 'Nombre de notifications non lues récupéré avec succès',
            data: {
                unreadCount: count
            }
        });

    } catch (error) {
        console.error('Erreur lors du comptage des notifications non lues:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur lors du comptage des notifications non lues',
            error: error.message
        });
    }
};

// Marquer une notification comme lue
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.user_id;
        
        // Vérifier que la notification existe et appartient à l'utilisateur
        const notification = await Notification.findById(id);
        
        if (!notification) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Notification non trouvée'
            });
        }
        
        if (notification.user_id !== userId) {
            return res.status(403).json({
                status: 'ERROR',
                message: 'Vous n\'avez pas l\'autorisation de modifier cette notification'
            });
        }
        
        const success = await Notification.markAsRead(id);
        
        if (!success) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Impossible de marquer la notification comme lue'
            });
        }
        
        res.status(200).json({
            status: 'SUCCESS',
            message: 'Notification marquée comme lue'
        });

    } catch (error) {
        console.error('Erreur lors du marquage de la notification comme lue:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur lors du marquage de la notification comme lue',
            error: error.message
        });
    }
};

// Marquer toutes les notifications comme lues
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        const count = await Notification.markAllAsRead(userId);
        
        res.status(200).json({
            status: 'SUCCESS',
            message: `${count} notification(s) marquée(s) comme lue(s)`,
            data: {
                markedCount: count
            }
        });

    } catch (error) {
        console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur lors du marquage de toutes les notifications comme lues',
            error: error.message
        });
    }
};

// Supprimer une notification
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.user_id;
        
        // Vérifier que la notification existe et appartient à l'utilisateur
        const notification = await Notification.findById(id);
        
        if (!notification) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Notification non trouvée'
            });
        }
        
        if (notification.user_id !== userId) {
            return res.status(403).json({
                status: 'ERROR',
                message: 'Vous n\'avez pas l\'autorisation de supprimer cette notification'
            });
        }
        
        const success = await Notification.delete(id);
        
        if (!success) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Impossible de supprimer la notification'
            });
        }
        
        res.status(200).json({
            status: 'SUCCESS',
            message: 'Notification supprimée avec succès'
        });

    } catch (error) {
        console.error('Erreur lors de la suppression de la notification:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur lors de la suppression de la notification',
            error: error.message
        });
    }
};

