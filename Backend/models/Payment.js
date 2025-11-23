const db = require('../config/database');

class Payment {
    // Créer un paiement
    static async create(paymentData) {
        const { recruiter_id, offer_id, amount, payment_method, transaction_id, status } = paymentData;
        const [result] = await db.query(
            'INSERT INTO payments (recruiter_id, offer_id, amount, payment_method, transaction_id, status) VALUES (?, ?, ?, ?, ?, ?)',
            [recruiter_id, offer_id || null, amount, payment_method, transaction_id || null, status || 'pending']
        );
        return result.insertId;
    }

    // Trouver un paiement par ID
    static async findById(id) {
        const [rows] = await db.query(`
            SELECT p.*, r.company_name, u.email 
            FROM payments p 
            JOIN recruiters r ON p.recruiter_id = r.id 
            JOIN users u ON r.user_id = u.id 
            WHERE p.id = ?
        `, [id]);
        return rows[0];
    }

    // Trouver un paiement par transaction_id
    static async findByTransactionId(transaction_id) {
        const [rows] = await db.query('SELECT * FROM payments WHERE transaction_id = ?', [transaction_id]);
        return rows[0];
    }

    // Récupérer les paiements d'un recruteur
    static async findByRecruiterId(recruiter_id) {
        const [rows] = await db.query(`
            SELECT p.*, o.title as offer_title 
            FROM payments p 
            LEFT JOIN offers o ON p.offer_id = o.id 
            WHERE p.recruiter_id = ? 
            ORDER BY p.payment_date DESC
        `, [recruiter_id]);
        return rows;
    }

    // Récupérer tous les paiements
    static async findAll() {
        const [rows] = await db.query(`
            SELECT p.*, r.company_name, o.title as offer_title 
            FROM payments p 
            JOIN recruiters r ON p.recruiter_id = r.id 
            LEFT JOIN offers o ON p.offer_id = o.id 
            ORDER BY p.payment_date DESC
        `);
        return rows;
    }

    // Mettre à jour le statut d'un paiement
    static async updateStatus(id, status, transaction_id = null) {
        let query = 'UPDATE payments SET status = ?';
        const params = [status];

        if (transaction_id) {
            query += ', transaction_id = ?';
            params.push(transaction_id);
        }

        query += ' WHERE id = ?';
        params.push(id);

        const [result] = await db.query(query, params);
        return result.affectedRows > 0;
    }

    // Supprimer un paiement
    static async delete(id) {
        const [result] = await db.query('DELETE FROM payments WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Payment;
