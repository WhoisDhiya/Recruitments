const db = require('../config/database');

class PendingRecruiter {
    // Create a pending recruiter record (store hashed_password)
    static async create(data) {
        const { last_name, first_name, email, hashed_password, role, company_name, industry, description, company_email, company_address } = data;
        const [result] = await db.query(
            `INSERT INTO pending_recruiters (last_name, first_name, email, hashed_password, role, company_name, industry, description, company_email, company_address, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [last_name, first_name, email, hashed_password, role, company_name, industry, description, company_email, company_address]
        );
        return result.insertId;
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM pending_recruiters WHERE id = ?', [id]);
        return rows[0];
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM pending_recruiters WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = PendingRecruiter;
