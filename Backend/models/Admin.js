const db = require('../config/database');

class Admin {
    // Créer un profil admin
    static async create(user_id) {
        const [result] = await db.query(
            'INSERT INTO admins (user_id) VALUES (?)',
            [user_id]
        );
        return result.insertId;
    }

    // Trouver un admin par user_id
    static async findByUserId(user_id) {
        const [rows] = await db.query(`
            SELECT a.*, u.last_name, u.first_name, u.email, u.role 
            FROM admins a 
            JOIN users u ON a.user_id = u.id 
            WHERE a.user_id = ?
        `, [user_id]);
        return rows[0];
    }

    // Trouver un admin par ID
    static async findById(id) {
        const [rows] = await db.query(`
            SELECT a.*, u.last_name, u.first_name, u.email, u.role 
            FROM admins a 
            JOIN users u ON a.user_id = u.id 
            WHERE a.id = ?
        `, [id]);
        return rows[0];
    }

    // Récupérer tous les admins
    static async findAll() {
        const [rows] = await db.query(`
            SELECT a.*, u.last_name, u.first_name, u.email 
            FROM admins a 
            JOIN users u ON a.user_id = u.id
        `);
        return rows;
    }

    // Supprimer un admin
    static async delete(id) {
        const [result] = await db.query('DELETE FROM admins WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Admin;


