const db = require('../config/database');

class Requirement {
    // Créer une exigence
    static async create(requirementData) {
        const { 
            offer_id, 
            jobTitle,
            tags,
            jobRole,
            minSalary,
            maxSalary,
            salaryType,
            education,
            experience,
            jobType,
            vacancies,
            expirationDate,
            jobLevel,
            description,
            responsibilities
        } = requirementData;

        const [result] = await db.query(
            `INSERT INTO requirements 
            (offer_id, jobTitle, tags, jobRole, minSalary, maxSalary, salaryType, 
             education, experience, jobType, vacancies, expirationDate, jobLevel, description, responsibilities) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [offer_id, jobTitle, tags, jobRole, minSalary, maxSalary, salaryType, 
             education, experience, jobType, vacancies, expirationDate, jobLevel, description, responsibilities]
        );
        return result.insertId;
    }

    // <CHANGE> Updated to handle all job posting fields
    static async update(id, requirementData) {
        const { 
            jobTitle,
            tags,
            jobRole,
            minSalary,
            maxSalary,
            salaryType,
            education,
            experience,
            jobType,
            vacancies,
            expirationDate,
            jobLevel,
            description,
            responsibilities
        } = requirementData;

        const [result] = await db.query(
            `UPDATE requirements 
            SET jobTitle = ?, tags = ?, jobRole = ?, minSalary = ?, maxSalary = ?, 
                salaryType = ?, education = ?, experience = ?, jobType = ?, vacancies = ?, 
                expirationDate = ?, jobLevel = ?, description = ?, responsibilities = ? 
            WHERE id = ?`,
            [jobTitle, tags, jobRole, minSalary, maxSalary, salaryType, education, 
             experience, jobType, vacancies, expirationDate, jobLevel, description, responsibilities, id]
        );
        return result.affectedRows > 0;
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
