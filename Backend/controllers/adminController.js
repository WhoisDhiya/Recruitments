const db = require('../config/database');
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const Recruiter = require('../models/Recruiter');
const Offer = require('../models/Offer');
const Application = require('../models/Application');

// ===== USERS =====
exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json({ status: 'SUCCESS', data: users });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: 'Erreur récupération utilisateurs', error: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ status: 'ERROR', message: 'Utilisateur non trouvé' });
        res.json({ status: 'SUCCESS', data: user });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: 'Erreur récupération utilisateur', error: error.message });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const allowed = ['candidate', 'recruiter', 'admin'];
        if (!allowed.includes(role)) {
            return res.status(400).json({ status: 'ERROR', message: 'Rôle invalide' });
        }
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ status: 'ERROR', message: 'Utilisateur non trouvé' });
        const [result] = await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        if (!result.affectedRows) return res.status(400).json({ status: 'ERROR', message: 'Mise à jour du rôle échouée' });
        const updated = await User.findById(id);
        res.json({ status: 'SUCCESS', message: 'Rôle mis à jour', data: updated });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: 'Erreur mise à jour rôle', error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ status: 'ERROR', message: 'Utilisateur non trouvé' });
        const deleted = await User.delete(id);
        if (!deleted) return res.status(400).json({ status: 'ERROR', message: 'Suppression échouée' });
        res.json({ status: 'SUCCESS', message: 'Utilisateur supprimé' });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: 'Erreur suppression utilisateur', error: error.message });
    }
};

// ===== CANDIDATES =====
exports.getCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.findAll();
        res.json({ status: 'SUCCESS', data: candidates });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: 'Erreur récupération candidats', error: error.message });
    }
};

exports.getCandidateById = async (req, res) => {
    try {
        const { id } = req.params;
        const candidate = await Candidate.findById(id);
        if (!candidate) return res.status(404).json({ status: 'ERROR', message: 'Candidat non trouvé' });
        res.json({ status: 'SUCCESS', data: candidate });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: 'Erreur récupération candidat', error: error.message });
    }
};

exports.deleteCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        const candidate = await Candidate.findById(id);
        if (!candidate) return res.status(404).json({ status: 'ERROR', message: 'Candidat non trouvé' });
        const deleted = await Candidate.delete(id);
        if (!deleted) return res.status(400).json({ status: 'ERROR', message: 'Suppression échouée' });
        res.json({ status: 'SUCCESS', message: 'Candidat supprimé' });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: 'Erreur suppression candidat', error: error.message });
    }
};

// ===== RECRUITERS =====
exports.getRecruiters = async (req, res) => {
    try {
        const recruiters = await Recruiter.findAll();
        res.json({ status: 'SUCCESS', data: recruiters });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: 'Erreur récupération recruteurs', error: error.message });
    }
};

exports.getRecruiterById = async (req, res) => {
    try {
        const { id } = req.params;
        const recruiter = await Recruiter.findById(id);
        if (!recruiter) return res.status(404).json({ status: 'ERROR', message: 'Recruteur non trouvé' });
        res.json({ status: 'SUCCESS', data: recruiter });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: 'Erreur récupération recruteur', error: error.message });
    }
};

exports.deleteRecruiter = async (req, res) => {
    try {
        const { id } = req.params;
        const recruiter = await Recruiter.findById(id);
        if (!recruiter) return res.status(404).json({ status: 'ERROR', message: 'Recruteur non trouvé' });
        const deleted = await Recruiter.delete(id);
        if (!deleted) return res.status(400).json({ status: 'ERROR', message: 'Suppression échouée' });
        res.json({ status: 'SUCCESS', message: 'Recruteur supprimé' });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: 'Erreur suppression recruteur', error: error.message });
    }
};

// ===== OFFERS =====
exports.getOffers = async (req, res) => {
    try {
        const offers = await Offer.findAll();
        res.json({ status: 'SUCCESS', data: offers });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: 'Erreur récupération offres', error: error.message });
    }
};

exports.getOfferById = async (req, res) => {
    try {
        const { id } = req.params;
        const offer = await Offer.findById(id);
        if (!offer) return res.status(404).json({ status: 'ERROR', message: 'Offre non trouvée' });
        res.json({ status: 'SUCCESS', data: offer });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: 'Erreur récupération offre', error: error.message });
    }
};

exports.deleteOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const offer = await Offer.findById(id);
        if (!offer) return res.status(404).json({ status: 'ERROR', message: 'Offre non trouvée' });
        const deleted = await Offer.delete(id);
        if (!deleted) return res.status(400).json({ status: 'ERROR', message: 'Suppression échouée' });
        res.json({ status: 'SUCCESS', message: 'Offre supprimée' });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: 'Erreur suppression offre', error: error.message });
    }
};

// ===== APPLICATIONS =====
exports.getApplications = async (req, res) => {
    try {
        const apps = await Application.findAll();
        res.json({ status: 'SUCCESS', data: apps });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: 'Erreur récupération candidatures', error: error.message });
    }
};

exports.updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const allowed = ['pending', 'reviewed', 'accepted', 'rejected'];
        if (!allowed.includes(status)) {
            return res.status(400).json({ status: 'ERROR', message: 'Statut invalide' });
        }
        const updated = await Application.updateStatus(id, status);
        if (!updated) return res.status(400).json({ status: 'ERROR', message: 'Mise à jour échouée' });
        res.json({ status: 'SUCCESS', message: 'Statut mis à jour' });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: 'Erreur mise à jour statut', error: error.message });
    }
};

exports.deleteApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Application.delete(id);
        if (!deleted) return res.status(400).json({ status: 'ERROR', message: 'Suppression échouée' });
        res.json({ status: 'SUCCESS', message: 'Candidature supprimée' });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: 'Erreur suppression candidature', error: error.message });
    }
};

// ===== NOTIFICATIONS =====
exports.getNotifications = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM notifications ORDER BY sent_at DESC');
        res.json({ status: 'SUCCESS', data: rows });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: 'Erreur récupération notifications', error: error.message });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM notifications WHERE id = ?', [id]);
        if (!result.affectedRows) return res.status(404).json({ status: 'ERROR', message: 'Notification non trouvée' });
        res.json({ status: 'SUCCESS', message: 'Notification supprimée' });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: 'Erreur suppression notification', error: error.message });
    }
};

// ===== STATS =====
exports.getStats = async (req, res) => {
    try {
        const [[{ users }]] = await db.query('SELECT COUNT(*) AS users FROM users');
        const [[{ candidates }]] = await db.query('SELECT COUNT(*) AS candidates FROM candidates');
        const [[{ recruiters }]] = await db.query('SELECT COUNT(*) AS recruiters FROM recruiters');
        const [[{ offers }]] = await db.query('SELECT COUNT(*) AS offers FROM offers');
        const [[{ applications }]] = await db.query('SELECT COUNT(*) AS applications FROM applications');
        res.json({
            status: 'SUCCESS',
            data: { users, candidates, recruiters, offers, applications }
        });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: 'Erreur récupération statistiques', error: error.message });
    }
};


