const db = require('../config/database');

// Les types de packs autorisés
const validNames = ['basic', 'standard', 'premium'];

class Pack {
    // Créer un pack
    static async create(packData) {
        const { name, price, job_limit, candidate_limit, visibility_days, description } = packData;

        // Vérifier que le nom du pack est valide
        if (!validNames.includes(name)) {
            throw new Error('Type de pack invalide. Les types valides sont : basic, standard, premium.');
        }

        const [result] = await db.query(
            `INSERT INTO packs 
             (name, price, job_limit, candidate_limit, visibility_days, description) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, price, job_limit, candidate_limit, visibility_days, description]
        );
        return result.insertId;
    }

    // Récupérer un pack par ID
    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM packs WHERE id = ?', [id]);
        return rows[0];
    }

    // Récupérer tous les packs
    static async findAll() {
        const [rows] = await db.query('SELECT * FROM packs ORDER BY created_at DESC');
        return rows;
    }

    // Mettre à jour un pack
    static async update(id, packData) {
        const { name, price, job_limit, candidate_limit, visibility_days, description } = packData;

        // Vérifier que le nom du pack est valide
        if (name && !validNames.includes(name)) {
            throw new Error('Type de pack invalide. Les types valides sont : basic, standard, premium.');
        }

        const [result] = await db.query(
            `UPDATE packs 
             SET name = ?, price = ?, job_limit = ?, candidate_limit = ?, visibility_days = ?, description = ? 
             WHERE id = ?`,
            [name, price, job_limit, candidate_limit, visibility_days, description, id]
        );
        return result.affectedRows > 0;
    }

    // Supprimer un pack
    static async delete(id) {
        const [result] = await db.query('DELETE FROM packs WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Pack;
