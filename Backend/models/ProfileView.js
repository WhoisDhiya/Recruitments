const db = require('../config/database');

class ProfileView {

    // 1. Vérifier si un recruteur a déjà vu un candidat (pour ne pas repayer)
    static async hasViewed(recruiterId, candidateId) {
        const [rows] = await db.query(
            "SELECT * FROM profile_views WHERE recruiter_id = ? AND candidate_id = ?",
            [recruiterId, candidateId]
        );
        return rows.length > 0;
    }

    // 2. Compter combien de profils le recruteur a vus au total
    static async countByRecruiter(recruiterId) {
        const [rows] = await db.query(
            "SELECT COUNT(*) as total FROM profile_views WHERE recruiter_id = ?",
            [recruiterId]
        );
        return rows[0].total;
    }

    // 3. Enregistrer une nouvelle vue (Débiter un crédit)
    static async add(recruiterId, candidateId) {
        return db.query(
            "INSERT INTO profile_views (recruiter_id, candidate_id, viewed_at) VALUES (?, ?, NOW())",
            [recruiterId, candidateId]
        );
    }
}

module.exports = ProfileView;