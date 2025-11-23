const Candidate = require('../models/Candidate');
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Récupérer le profil complet d'un candidat
exports.getProfile = async (req, res) => {
    try {
        const { candidateId } = req.params;
        
        // Récupérer le profil candidat avec les infos utilisateur
        const candidate = await Candidate.findById(candidateId);
        
        if (!candidate) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Candidat non trouvé'
            });
        }

        res.status(200).json({
            status: 'SUCCESS',
            message: 'Profil candidat récupéré avec succès',
            data: {
                id: candidate.id,
                user_id: candidate.user_id,
                last_name: candidate.last_name,
                first_name: candidate.first_name,
                email: candidate.email,
                role: candidate.role,
                cv: candidate.cv,
                image: candidate.image,
                created_at: candidate.created_at,
                updated_at: candidate.updated_at
            }
        });

    } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur lors de la récupération du profil',
            error: error.message
        });
    }
};

// Récupérer le profil par user_id
exports.getProfileByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const candidate = await Candidate.findByUserId(userId);
        
        if (!candidate) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Candidat non trouvé'
            });
        }

        res.status(200).json({
            status: 'SUCCESS',
            message: 'Profil candidat récupéré avec succès',
            data: {
                id: candidate.id,
                user_id: candidate.user_id,
                last_name: candidate.last_name,
                first_name: candidate.first_name,
                email: candidate.email,
                role: candidate.role,
                cv: candidate.cv,
                image: candidate.image,
                created_at: candidate.created_at,
                updated_at: candidate.updated_at
            }
        });

    } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur lors de la récupération du profil',
            error: error.message
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { candidateId } = req.params;
        const { cv, image, oldPassword, newPassword } = req.body;

        // Vérifier que le candidat existe
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Candidat non trouvé'
            });
        }

        // ✅ 1 — Mise à jour CV / image
        const updateData = {};
        if (cv) updateData.cv = cv;
        if (image) updateData.image = image;

        if (cv || image) {
            await Candidate.update(candidateId, updateData);
        }

        // ✅ 2 — Mise à jour du mot de passe SI fourni
        if (oldPassword && newPassword) {
            const user = await User.findById(candidate.user_id);

            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'Ancien mot de passe incorrect'
                });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await User.updatePassword(user.id, hashedPassword);
        }

        res.status(200).json({
            status: 'SUCCESS',
            message: 'Profil mis à jour avec succès'
        });

    } catch (error) {
        console.error('Erreur updateProfile:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur lors de la mise à jour',
            error: error.message
        });
    }
};


// Récupérer les candidatures d'un candidat
exports.getApplications = async (req, res) => {
    try {
        const { candidateId } = req.params;
        
        const applications = await Candidate.getApplications(candidateId);
        
        res.status(200).json({
            status: 'SUCCESS',
            message: 'Candidatures récupérées avec succès',
            data: applications
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des candidatures:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur lors de la récupération des candidatures',
            error: error.message
        });
    }
};

// Récupérer tous les candidats (admin)
exports.getAllCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.findAll();
        
        res.status(200).json({
            status: 'SUCCESS',
            message: 'Liste des candidats récupérée avec succès',
            data: candidates
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des candidats:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur lors de la récupération des candidats',
            error: error.message
        });
    }
};
