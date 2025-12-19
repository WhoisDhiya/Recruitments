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

    // Vérifier si un company_email existe déjà (dans users ou dans recruiters)
    // excludeRecruiterId: optionnel, pour exclure un recruteur lors d'une mise à jour
    static async isCompanyEmailUnique(company_email, excludeRecruiterId = null) {
        const normalizedEmail = company_email.trim().toLowerCase();
        
        // Vérifier si l'email existe dans la table users
        const [userRows] = await db.query(
            'SELECT id FROM users WHERE LOWER(email) = ?',
            [normalizedEmail]
        );
        
        if (userRows.length > 0) {
            return { unique: false, reason: 'Cet email est déjà utilisé par un utilisateur' };
        }
        
        // Vérifier si l'email existe dans la table recruiters
        let query = 'SELECT id FROM recruiters WHERE LOWER(company_email) = ?';
        let params = [normalizedEmail];
        
        if (excludeRecruiterId) {
            query += ' AND id != ?';
            params.push(excludeRecruiterId);
        }
        
        const [recruiterRows] = await db.query(query, params);
        
        if (recruiterRows.length > 0) {
            return { unique: false, reason: 'Cet email d\'entreprise est déjà utilisé par un autre recruteur' };
        }
        
        return { unique: true };
    }
}

module.exports = Recruiter;
