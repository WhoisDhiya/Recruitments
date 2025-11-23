const db = require('../config/database');

class Application {
    // Créer une candidature
    static async create(applicationData) {
        const { candidate_id, offer_id, status } = applicationData;
        const [result] = await db.query(
            'INSERT INTO applications (candidate_id, offer_id, status) VALUES (?, ?, ?)',
            [candidate_id, offer_id, status || 'pending']
        );
        // Retourner l'id inséré
        return result.insertId;
    }

    // Trouver une candidature par ID
    static async findById(id) {
        const [rows] = await db.query(`
            SELECT a.*, 
                   c.cv, c.image,
                   u.last_name, u.first_name, u.email,
                   o.title as offer_title,
                   r.company_name
            FROM applications a 
            JOIN candidates c ON a.candidate_id = c.id 
            JOIN users u ON c.user_id = u.id 
            JOIN offers o ON a.offer_id = o.id
            JOIN recruiters r ON o.recruiter_id = r.id
            WHERE a.id = ?
        `, [id]);
        return rows[0]; // ✅ Très important pour éviter undefined
    }

    // Mettre à jour le statut
    static async updateStatus(id, status) {
        const [result] = await db.query(
            'UPDATE applications SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows > 0;
    }

    // Vérifier si un candidat a déjà postulé
    static async checkExistingApplication(candidate_id, offer_id) {
        const [rows] = await db.query(
            'SELECT * FROM applications WHERE candidate_id = ? AND offer_id = ?',
            [candidate_id, offer_id]
        );
        return rows.length > 0;
    }

    // Récupérer toutes les candidatures
    static async findAll() {
        const [rows] = await db.query(`
            SELECT a.*, 
                   u.last_name, u.first_name, u.email,
                   o.title as offer_title, r.company_name
            FROM applications a 
            JOIN candidates c ON a.candidate_id = c.id 
            JOIN users u ON c.user_id = u.id
            JOIN offers o ON a.offer_id = o.id
            JOIN recruiters r ON o.recruiter_id = r.id
            ORDER BY a.date_application DESC
        `);
        return rows;
    }

    // Supprimer une candidature
    static async delete(id) {
        const [result] = await db.query('DELETE FROM applications WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Application;
