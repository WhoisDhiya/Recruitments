const db = require('../config/database');

class Notification {
    // Créer une notification
    static async create(notificationData) {
        const { user_id, application_id, email, subject, message } = notificationData;
        const [result] = await db.query(
            'INSERT INTO notifications (user_id, application_id, email, subject, message, status) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, application_id || null, email, subject, message, 'unread']
        );
        return result.insertId;
    }

    // Récupérer les notifications d'un utilisateur
    static async findByUserId(user_id) {
        const [rows] = await db.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY sent_at DESC',
            [user_id]
        );
        return rows;
    }

    // Récupérer les notifications non lues d'un utilisateur
    static async findUnreadByUserId(user_id) {
        const [rows] = await db.query(
            'SELECT * FROM notifications WHERE user_id = ? AND status = "unread" ORDER BY sent_at DESC',
            [user_id]
        );
        return rows;
    }

    // Marquer une notification comme lue
    static async markAsRead(id) {
        const [result] = await db.query(
            'UPDATE notifications SET status = "read" WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // Marquer toutes les notifications d'un utilisateur comme lues
    static async markAllAsRead(user_id) {
        const [result] = await db.query(
            'UPDATE notifications SET status = "read" WHERE user_id = ? AND status = "unread"',
            [user_id]
        );
        return result.affectedRows;
    }

    // Supprimer une notification
    static async delete(id) {
        const [result] = await db.query('DELETE FROM notifications WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Compter les notifications non lues
    static async countUnread(user_id) {
        const [rows] = await db.query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND status = "unread"',
            [user_id]
        );
        return rows[0].count;
    }
}

module.exports = Notification;
