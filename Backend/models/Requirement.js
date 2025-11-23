const db = require('../config/database');

class Requirement {
    // Créer une exigence
    static async create(requirementData) {
        const { offer_id, description } = requirementData;
        const [result] = await db.query(
            'INSERT INTO requirements (offer_id, description) VALUES (?, ?)',
            [offer_id, description]
        );
        return result.insertId;
    }

    // Récupérer les exigences d'une offre
    static async findByOfferId(offer_id) {
        const [rows] = await db.query(
            'SELECT * FROM requirements WHERE offer_id = ?',
            [offer_id]
        );
        return rows;
    }

    // Trouver une exigence par ID
    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM requirements WHERE id = ?', [id]);
        return rows[0];
    }

    // Mettre à jour une exigence
    static async update(id, description) {
        const [result] = await db.query(
            'UPDATE requirements SET description = ? WHERE id = ?',
            [description, id]
        );
        return result.affectedRows > 0;
    }

    // Supprimer une exigence
    static async delete(id) {
        const [result] = await db.query('DELETE FROM requirements WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Supprimer toutes les exigences d'une offre
    static async deleteByOfferId(offer_id) {
        const [result] = await db.query('DELETE FROM requirements WHERE offer_id = ?', [offer_id]);
        return result.affectedRows;
    }
}

module.exports = Requirement;
