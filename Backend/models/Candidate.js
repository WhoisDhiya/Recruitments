const db = require('../config/database');

class Candidate {
    // Créer un profil candidat
    static async create(candidateData) {
        const { user_id, cv, image } = candidateData;
        const [result] = await db.query(
            'INSERT INTO candidates (user_id, cv, image) VALUES (?, ?, ?)',
            [user_id, cv, image]
        );
        return result.insertId;
    }

    // Trouver un candidat par user_id
    static async findByUserId(user_id) {
        const [rows] = await db.query(`
            SELECT c.*, u.last_name, u.first_name, u.email, u.role 
            FROM candidates c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.user_id = ?
        `, [user_id]);
        return rows[0];
    }

    // Trouver un candidat par ID
    static async findById(id) {
        const [rows] = await db.query(`
            SELECT c.*, u.last_name, u.first_name, u.email, u.role 
            FROM candidates c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.id = ?
        `, [id]);
        return rows[0];
    }

    // Mettre à jour le profil candidat (mise à jour dynamique)
    static async update(id, candidateData) {
        // Construire la requête dynamiquement en fonction des champs fournis
        const fields = [];
        const values = [];

        if (candidateData.cv !== undefined) {
            fields.push('cv = ?');
            values.push(candidateData.cv);
        }

        if (candidateData.image !== undefined) {
            fields.push('image = ?');
            values.push(candidateData.image);
        }

        // Si aucun champ à mettre à jour, retourner false
        if (fields.length === 0) {
            return false;
        }

        // Ajouter l'ID à la fin des valeurs
        values.push(id);

        // Construire et exécuter la requête
        const query = `UPDATE candidates SET ${fields.join(', ')} WHERE id = ?`;
        const [result] = await db.query(query, values);
        
        return result.affectedRows > 0;
    }

    // Récupérer tous les candidats
    static async findAll() {
        const [rows] = await db.query(`
            SELECT c.*, u.last_name, u.first_name, u.email 
            FROM candidates c 
            JOIN users u ON c.user_id = u.id
        `);
        return rows;
    }

    // Supprimer un candidat
    static async delete(id) {
        const [result] = await db.query('DELETE FROM candidates WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Récupérer les candidatures d'un candidat
    static async getApplications(candidate_id) {
        const [rows] = await db.query(`
            SELECT a.*, o.title as offer_title, r.company_name
            FROM applications a 
            JOIN offers o ON a.offer_id = o.id 
            JOIN recruiters r ON o.recruiter_id = r.id
            WHERE a.candidate_id = ? 
            ORDER BY a.date_application DESC
        `, [candidate_id]);
        return rows;
    }
}

module.exports = Candidate;
