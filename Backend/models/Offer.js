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
            SELECT 
                a.id AS application_id,
                a.candidate_id,
                a.offer_id,
                a.status,
                a.date_application,
                a.phone,
                a.address,
                a.portfolio_url,
                a.cover_letter,
                a.cv_file,
                c.id AS candidate_id_table,
                c.cv,
                c.image,
                c.user_id AS candidate_user_id,
                u.id AS user_id,
                u.first_name,
                u.last_name,
                u.email,
                u.role
            FROM applications a 
            JOIN candidates c ON a.candidate_id = c.id 
            JOIN users u ON c.user_id = u.id 
            WHERE a.offer_id = ? 
            ORDER BY a.date_application DESC
        `, [offer_id]);
        
        // Normaliser les résultats pour éviter les conflits de colonnes
        return rows.map(row => ({
            id: row.application_id, // ID de l'application (le plus important)
            application_id: row.application_id,
            candidate_id: row.candidate_id,
            offer_id: row.offer_id,
            status: row.status,
            date_application: row.date_application,
            phone: row.phone,
            address: row.address,
            portfolio_url: row.portfolio_url,
            cover_letter: row.cover_letter,
            cv_file: row.cv_file,
            candidate: {
                id: row.candidate_id_table,
                cv: row.cv,
                image: row.image,
                user_id: row.candidate_user_id
            },
            candidate_first_name: row.first_name,
            candidate_last_name: row.last_name,
            candidate_email: row.email,
            email: row.email, // Pour compatibilité
            cv: row.cv // Pour compatibilité
        }));
    }
}

module.exports = Offer;
