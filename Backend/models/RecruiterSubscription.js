const db = require('../config/database');

class RecruiterSubscription {
    // Créer une souscription
    static async create(subscriptionData) {
        const { recruiter_id, pack_id, start_date, end_date, status } = subscriptionData;
        const [result] = await db.query(
            `INSERT INTO recruiter_subscriptions (recruiter_id, pack_id, start_date, end_date, status) 
             VALUES (?, ?, ?, ?, ?)`,
            [recruiter_id, pack_id, start_date || new Date(), end_date, status || 'active']
        );
        return result.insertId;
    }

    // Récupérer une souscription par ID
    static async findById(id) {
        const [rows] = await db.query(
            `SELECT rs.*, r.company_name, p.name AS pack_name, p.price
             FROM recruiter_subscriptions rs
             JOIN recruiters r ON rs.recruiter_id = r.id
             JOIN packs p ON rs.pack_id = p.id
             WHERE rs.id = ?`,
            [id]
        );
        return rows[0];
    }

    // Récupérer toutes les souscriptions
    static async findAll() {
        const [rows] = await db.query(
            `SELECT rs.*, r.company_name, p.name AS pack_name, p.price
             FROM recruiter_subscriptions rs
             JOIN recruiters r ON rs.recruiter_id = r.id
             JOIN packs p ON rs.pack_id = p.id
             ORDER BY rs.start_date DESC`
        );
        return rows;
    }

    // Mettre à jour le statut ou dates
    static async update(id, updateData) {
        const { start_date, end_date, status } = updateData;
        const [result] = await db.query(
            `UPDATE recruiter_subscriptions 
             SET start_date = ?, end_date = ?, status = ? 
             WHERE id = ?`,
            [start_date, end_date, status, id]
        );
        return result.affectedRows > 0;
    }

    // Supprimer une souscription
    static async delete(id) {
        const [result] = await db.query('DELETE FROM recruiter_subscriptions WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Vérifier si un recruteur a déjà une souscription active
    static async checkActive(recruiter_id) {
        const [rows] = await db.query(
            `SELECT * FROM recruiter_subscriptions 
             WHERE recruiter_id = ? AND status = 'active' 
             ORDER BY end_date DESC LIMIT 1`,
            [recruiter_id]
        );
        return rows[0];
    }
}

module.exports = RecruiterSubscription;
