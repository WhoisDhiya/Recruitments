const db = require('../config/database');

class User {
    // Créer un nouvel utilisateur
    static async create(userData) {
        const { last_name, first_name, email, password, role } = userData;
        const [result] = await db.query(
            'INSERT INTO users (last_name, first_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [last_name, first_name, email, password, role]
        );
        return result.insertId;
    }

    // Trouver un utilisateur par email
    static async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    // Trouver un utilisateur par ID
    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    // Mettre à jour le profil utilisateur
    static async updateProfile(id, userData) {
        const { last_name, first_name, email } = userData;
        const [result] = await db.query(
            'UPDATE users SET last_name = ?, first_name = ?, email = ? WHERE id = ?',
            [last_name, first_name, email, id]
        );
        return result.affectedRows > 0;
    }

    // Mettre à jour le mot de passe
    static async updatePassword(id, hashedPassword) {
        const [result] = await db.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, id]
        );
        return result.affectedRows > 0;
    }

    // Supprimer un utilisateur
    static async delete(id) {
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Récupérer tous les utilisateurs
    static async findAll() {
        const [rows] = await db.query('SELECT id, last_name, first_name, email, role, created_at FROM users');
        return rows;
    }

    // Récupérer les utilisateurs par rôle
    static async findByRole(role) {
        const [rows] = await db.query('SELECT id, last_name, first_name, email, role, created_at FROM users WHERE role = ?', [role]);
        return rows;
    }
}

module.exports = User;
