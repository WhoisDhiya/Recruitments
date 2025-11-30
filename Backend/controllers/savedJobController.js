const SavedJob = require('../models/SavedJob');
const db = require('../config/database');

// Sauvegarder une offre
exports.saveJob = async (req, res) => {
    try {
        const userId = req.user.user_id; // ID de la table users depuis le JWT
        
        // Trouver le candidat_id à partir du user_id
        const [candidateRows] = await db.query(
            'SELECT id FROM candidates WHERE user_id = ?',
            [userId]
        );

        if (candidateRows.length === 0) {
            return res.status(403).json({
                status: 'ERROR',
                message: 'Accès refusé. Vous devez être un candidat pour sauvegarder des offres.'
            });
        }

        const candidateId = candidateRows[0].id;
        const { offer_id } = req.body;

        if (!offer_id) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'offer_id est obligatoire'
            });
        }

        // Vérifier si l'offre existe
        const [offerRows] = await db.query(
            'SELECT id FROM offers WHERE id = ?',
            [offer_id]
        );

        if (offerRows.length === 0) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Offre non trouvée'
            });
        }

        // Vérifier si l'offre est déjà sauvegardée
        const alreadySaved = await SavedJob.exists(candidateId, offer_id);
        if (alreadySaved) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Cette offre est déjà sauvegardée'
            });
        }

        // Sauvegarder l'offre
        const savedJobId = await SavedJob.create(candidateId, offer_id);

        console.log(`✅ Offre ${offer_id} sauvegardée pour le candidat ${candidateId} (ID saved_job: ${savedJobId})`);
        
        // Vérifier que la sauvegarde a bien été effectuée
        const exists = await SavedJob.exists(candidateId, offer_id);
        console.log(`✅ Vérification: Offre ${offer_id} existe dans saved_jobs: ${exists}`);

        res.status(201).json({
            status: 'SUCCESS',
            message: 'Offre sauvegardée avec succès'
        });

    } catch (error) {
        console.error('Erreur sauvegarde offre:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// Retirer une offre sauvegardée
exports.unsaveJob = async (req, res) => {
    try {
        const userId = req.user.user_id; // ID de la table users depuis le JWT
        
        // Trouver le candidat_id à partir du user_id
        const [candidateRows] = await db.query(
            'SELECT id FROM candidates WHERE user_id = ?',
            [userId]
        );

        if (candidateRows.length === 0) {
            return res.status(403).json({
                status: 'ERROR',
                message: 'Accès refusé. Vous devez être un candidat.'
            });
        }

        const candidateId = candidateRows[0].id;
        const { offer_id } = req.params;

        if (!offer_id) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'offer_id est obligatoire'
            });
        }

        // Retirer l'offre sauvegardée
        const deleted = await SavedJob.delete(candidateId, offer_id);

        if (!deleted) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Offre sauvegardée non trouvée'
            });
        }

        res.status(200).json({
            status: 'SUCCESS',
            message: 'Offre retirée des sauvegardes avec succès'
        });

    } catch (error) {
        console.error('Erreur suppression offre sauvegardée:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// Récupérer toutes les offres sauvegardées d'un candidat
exports.getSavedJobs = async (req, res) => {
    try {
        const userId = req.user.user_id; // ID de la table users depuis le JWT
        
        console.log(`🔍 User ID from JWT: ${userId}`);
        
        // Trouver le candidat_id à partir du user_id
        const [candidateRows] = await db.query(
            'SELECT id FROM candidates WHERE user_id = ?',
            [userId]
        );

        console.log(`🔍 Candidate rows found: ${candidateRows.length}`);
        
        if (candidateRows.length === 0) {
            console.error(`❌ Aucun candidat trouvé pour user_id: ${userId}`);
            return res.status(403).json({
                status: 'ERROR',
                message: 'Accès refusé. Vous devez être un candidat.'
            });
        }

        const candidateId = candidateRows[0].id;

        console.log(`🔍 Recherche des offres sauvegardées pour le candidat ID: ${candidateId} (user_id: ${userId})`);

        // Vérifier d'abord combien d'entrées il y a dans saved_jobs pour ce candidat
        const [countRows] = await db.query(
            'SELECT COUNT(*) as count FROM saved_jobs WHERE candidate_id = ?',
            [candidateId]
        );
        console.log(`📊 Nombre d'entrées dans saved_jobs pour candidat ${candidateId}: ${countRows[0].count}`);

        // Récupérer les offres sauvegardées
        const savedJobs = await SavedJob.findByCandidateId(candidateId);

        console.log(`✅ Récupération de ${savedJobs.length} offres sauvegardées pour le candidat ${candidateId}`);
        if (savedJobs.length > 0) {
            console.log('📋 Première offre:', JSON.stringify(savedJobs[0], null, 2));
        } else if (countRows[0].count > 0) {
            console.error(`❌ PROBLÈME: Il y a ${countRows[0].count} entrées dans saved_jobs mais la requête ne retourne rien!`);
        }

        res.status(200).json({
            status: 'SUCCESS',
            message: 'Offres sauvegardées récupérées avec succès',
            data: savedJobs
        });

    } catch (error) {
        console.error('❌ Erreur récupération offres sauvegardées:', error);
        console.error('❌ Stack trace:', error.stack);
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// Récupérer les IDs des offres sauvegardées (pour vérifier rapidement si une offre est sauvegardée)
exports.getSavedJobIds = async (req, res) => {
    try {
        const userId = req.user.user_id; // ID de la table users depuis le JWT
        
        // Trouver le candidat_id à partir du user_id
        const [candidateRows] = await db.query(
            'SELECT id FROM candidates WHERE user_id = ?',
            [userId]
        );

        if (candidateRows.length === 0) {
            return res.status(403).json({
                status: 'ERROR',
                message: 'Accès refusé. Vous devez être un candidat.'
            });
        }

        const candidateId = candidateRows[0].id;

        // Récupérer les IDs des offres sauvegardées
        const savedIds = await SavedJob.getSavedOfferIds(candidateId);

        res.status(200).json({
            status: 'SUCCESS',
            data: savedIds
        });

    } catch (error) {
        console.error('Erreur récupération IDs offres sauvegardées:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

