const db = require('../config/database');

class Offer {
    // Créer une offre
    static async create(offerData) {
        const { recruiter_id, title, date_offer, date_expiration } = offerData;
        const [result] = await db.query(
            'INSERT INTO offers (recruiter_id, title, date_offer, date_expiration) VALUES (?, ?, ?, ?)',
            [recruiter_id, title, date_offer, date_expiration || null]
        );
        return result.insertId;
    }

    // Trouver une offre par ID
    static async findById(id) {
        const [rows] = await db.query(`
            SELECT o.*, r.company_name, r.industry 
            FROM offers o 
            JOIN recruiters r ON o.recruiter_id = r.id 
            WHERE o.id = ?
        `, [id]);
        return rows[0];
    }

    // Récupérer toutes les offres
    static async findAll() {
        const [rows] = await db.query(`
            SELECT o.*, r.company_name 
            FROM offers o 
            JOIN recruiters r ON o.recruiter_id = r.id 
            ORDER BY o.date_offer DESC
        `);
        return rows;
    }

    // Mettre à jour une offre
    static async update(id, offerData) {
        const { title, date_offer, date_expiration } = offerData;
        const [result] = await db.query(
            'UPDATE offers SET title = ?, date_offer = ?, date_expiration = ? WHERE id = ?',
            [title, date_offer, date_expiration, id]
        );
        return result.affectedRows > 0;
    }

    // Supprimer une offre
    static async delete(id) {
        const [result] = await db.query('DELETE FROM offers WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Récupérer les offres d'un recruteur
    static async findByRecruiterId(recruiter_id) {
        const [rows] = await db.query(
            'SELECT * FROM offers WHERE recruiter_id = ? ORDER BY date_offer DESC',
            [recruiter_id]
        );
        return rows;
    }

    // Récupérer les candidatures d'une offre
    static async getApplications(offer_id) {
        const [rows] = await db.query(`
            SELECT a.*, c.*, u.last_name, u.first_name, u.email 
            FROM applications a 
            JOIN candidates c ON a.candidate_id = c.id 
            JOIN users u ON c.user_id = u.id 
            WHERE a.offer_id = ? 
            ORDER BY a.date_application DESC
        `, [offer_id]);
        return rows;
    }
}

module.exports = Offer;
