const db = require('../config/database');

class Recruiter {
    // Créer un profil recruteur
    static async create(recruiterData) {
        const { user_id, company_name, industry, description, company_email, company_address } = recruiterData;
        const [result] = await db.query(
            'INSERT INTO recruiters (user_id, company_name, industry, description, company_email, company_address) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, company_name, industry, description, company_email, company_address]
        );
        return result.insertId;
    }

    // Trouver un recruteur par user_id
    static async findByUserId(user_id) {
        const [rows] = await db.query(`
            SELECT r.*, u.last_name, u.first_name, u.email, u.role 
            FROM recruiters r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.user_id = ?
        `, [user_id]);
        return rows[0];
    }

    // Trouver un recruteur par ID
    static async findById(id) {
        const [rows] = await db.query(`
            SELECT r.*, u.last_name, u.first_name, u.email, u.role 
            FROM recruiters r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.id = ?
        `, [id]);
        return rows[0];
    }

    // Mettre à jour le profil recruteur
    static async update(id, recruiterData) {
        const { company_name, industry, description, company_email, company_address } = recruiterData;
        const [result] = await db.query(
            'UPDATE recruiters SET company_name = ?, industry = ?, description = ?, company_email = ?, company_address = ? WHERE id = ?',
            [company_name, industry, description, company_email, company_address, id]
        );
        return result.affectedRows > 0;
    }

    // Récupérer tous les recruteurs
    static async findAll() {
        const [rows] = await db.query(`
            SELECT r.*, u.last_name, u.first_name, u.email 
            FROM recruiters r 
            JOIN users u ON r.user_id = u.id
        `);
        return rows;
    }

    // Supprimer un recruteur
    static async delete(id) {
        const [result] = await db.query('DELETE FROM recruiters WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Récupérer les offres d'un recruteur
    static async getOffers(recruiter_id) {
        const [rows] = await db.query(
            'SELECT * FROM offers WHERE recruiter_id = ? ORDER BY date_offer DESC',
            [recruiter_id]
        );
        return rows;
    }
}

module.exports = Recruiter;
