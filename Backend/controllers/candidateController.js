const Candidate = require('../models/Candidate');
const User = require('../models/User');
const ProfileView = require('../models/ProfileView'); // ✅ Requis pour compter les vues
const db = require('../config/database'); // ✅ Requis pour vérifier l'abonnement
const bcrypt = require('bcrypt');

// =========================================================
// PARTIE 1 : GESTION CLASSIQUE (Candidat / Admin)
// =========================================================

// Récupérer le profil complet (Pour le candidat lui-même ou admin)
exports.getProfile = async (req, res) => {
    try {
        const { candidateId } = req.params;
        const candidate = await Candidate.findById(candidateId);
        
        if (!candidate) {
            return res.status(404).json({ status: 'ERROR', message: 'Candidat non trouvé' });
        }

        res.status(200).json({
            status: 'SUCCESS',
            message: 'Profil candidat récupéré avec succès',
            data: candidate
        });

    } catch (error) {
        console.error('Erreur récupération profil:', error);
        res.status(500).json({ status: 'ERROR', message: 'Erreur serveur', error: error.message });
    }
};

// Récupérer le profil par user_id
exports.getProfileByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const candidate = await Candidate.findByUserId(userId);
        
        if (!candidate) {
            return res.status(404).json({ status: 'ERROR', message: 'Candidat non trouvé' });
        }

        res.status(200).json({
            status: 'SUCCESS',
            message: 'Profil candidat récupéré avec succès',
            data: candidate
        });

    } catch (error) {
        console.error('Erreur récupération profil:', error);
        res.status(500).json({ status: 'ERROR', message: 'Erreur serveur', error: error.message });
    }
};

// Mise à jour du profil
exports.updateProfile = async (req, res) => {
    try {
        const { candidateId } = req.params;
        const { cv, image, oldPassword, newPassword } = req.body;

        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ status: 'ERROR', message: 'Candidat non trouvé' });
        }

        const updateData = {};
        if (cv) updateData.cv = cv;
        if (image) updateData.image = image;

        if (cv || image) {
            await Candidate.update(candidateId, updateData);
        }

        if (oldPassword && newPassword) {
            const user = await User.findById(candidate.user_id);
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ status: 'ERROR', message: 'Ancien mot de passe incorrect' });
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await User.updatePassword(user.id, hashedPassword);
        }

        res.status(200).json({ status: 'SUCCESS', message: 'Profil mis à jour avec succès' });

    } catch (error) {
        console.error('Erreur updateProfile:', error);
        res.status(500).json({ status: 'ERROR', message: 'Erreur mise à jour', error: error.message });
    }
};

// Récupérer les candidatures d'un candidat
exports.getApplications = async (req, res) => {
    try {
        const { candidateId } = req.params;
        const applications = await Candidate.getApplications(candidateId);
        
        res.status(200).json({ status: 'SUCCESS', data: applications });
    } catch (error) {
        console.error('Erreur candidatures:', error);
        res.status(500).json({ status: 'ERROR', message: 'Erreur serveur', error: error.message });
    }
};

// Récupérer tous les candidats (admin)
exports.getAllCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.findAll();
        res.status(200).json({ status: 'SUCCESS', data: candidates });
    } catch (error) {
        console.error('Erreur candidats:', error);
        res.status(500).json({ status: 'ERROR', message: 'Erreur serveur', error: error.message });
    }
};

// =========================================================
// 🛑 PARTIE 2 : LE GENDARME (Recruteur voit candidat)
// =========================================================

exports.getCandidateDetailsForRecruiter = async (req, res) => {
    try {
        const { id } = req.params; // ID du candidat
        const { recruiterId } = req.query; // ID du recruteur

        if (!recruiterId) {
            return res.status(400).json({ status: 'ERROR', message: "Identifiant recruteur manquant." });
        }

        // 1. Vérifier si le recruteur a DÉJÀ vu ce profil (Gratuit)
        const alreadyViewed = await ProfileView.hasViewed(recruiterId, id);

        if (alreadyViewed) {
            // On renvoie direct les infos, pas besoin de vérifier le quota
            const candidate = await Candidate.findById(id);
            return res.status(200).json({ 
                status: 'SUCCESS', 
                message: 'Profil (Déjà débloqué)', 
                data: candidate 
            });
        }

        // 2. Si c'est une NOUVELLE vue, on vérifie l'abonnement
        // ✅ CORRECTION ICI : Utilisation de 'candidate_limit' (comme dans ta DB)
        const checkSubQuery = `
            SELECT p.candidate_limit 
            FROM recruiter_subscriptions s
            JOIN packs p ON s.pack_id = p.id
            WHERE s.recruiter_id = ? AND s.status = 'active' AND s.end_date > NOW()
            LIMIT 1
        `;
        const [subscription] = await db.query(checkSubQuery, [recruiterId]);

        if (subscription.length === 0) {
            return res.status(403).json({ status: 'ERROR', message: "Abonnement requis." });
        }

        // ✅ CORRECTION ICI AUSSI
        const limit = subscription[0].candidate_limit;

        // 3. Compter combien de profils il a déjà consommés
        const currentUsage = await ProfileView.countByRecruiter(recruiterId);

        if (currentUsage >= limit) {
            return res.status(403).json({ 
                status: 'ERROR',
                message: `Limite atteinte ! Vous avez débloqué ${currentUsage}/${limit} profils. Passez au pack supérieur.` 
            });
        }

        // 4. Tout est bon : On débite un crédit (Enregistre la vue)
        await ProfileView.add(recruiterId, id);

        // 5. On renvoie les infos du candidat
        const candidate = await Candidate.findById(id);
        
        res.status(200).json({
            status: 'SUCCESS',
            message: 'Profil débloqué avec succès',
            data: candidate
        });

    } catch (error) {
        console.error('Erreur accès recruteur:', error);
        res.status(500).json({ status: 'ERROR', message: 'Erreur serveur', error: error.message });
    }
};