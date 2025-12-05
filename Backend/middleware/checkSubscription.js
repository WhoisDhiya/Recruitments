/**
 * Middleware pour vérifier qu'un recruteur a un abonnement actif
 * ✅ Utilise la date serveur SQL (NOW()) - ne peut pas être manipulé par le client
 */
const db = require('../config/database');
const RecruiterSubscription = require('../models/RecruiterSubscription');

const checkActiveSubscription = async (req, res, next) => {
    try {
        // Récupérer le recruiter_id depuis req.user (déjà vérifié par auth middleware)
        let recruiterId = null;

        // Si on a un recruiter_id dans les params
        if (req.params.recruiterId) {
            recruiterId = parseInt(req.params.recruiterId);
        } else if (req.params.recruiter_id) {
            recruiterId = parseInt(req.params.recruiter_id);
        } else if (req.user) {
            // Essayer de récupérer le recruiter_id depuis l'utilisateur
            const Recruiter = require('../models/Recruiter');
            const recruiter = await Recruiter.findByUserId(req.user.user_id || req.user.id);
            if (recruiter) {
                recruiterId = recruiter.id;
            }
        }

        if (!recruiterId) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Recruiter ID non trouvé'
            });
        }

        // ✅ Vérification avec date serveur SQL (NOW()) - ne peut pas être manipulé
        const subscription = await RecruiterSubscription.checkActive(recruiterId);

        if (!subscription) {
            return res.status(403).json({
                status: 'ERROR',
                message: 'Vous devez avoir un abonnement actif pour accéder à cette fonctionnalité.'
            });
        }

        // Ajouter l'abonnement à la requête pour utilisation ultérieure
        req.activeSubscription = subscription;
        next();
    } catch (error) {
        console.error('Erreur vérification abonnement:', error);
        return res.status(500).json({
            status: 'ERROR',
            message: 'Erreur lors de la vérification de l\'abonnement',
            error: error.message
        });
    }
};

module.exports = checkActiveSubscription;

