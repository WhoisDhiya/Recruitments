const db = require('../config/database');

class SavedJob {
    // Sauvegarder une offre pour un candidat
    static async create(candidateId, offerId) {
        const [result] = await db.query(
            'INSERT INTO saved_jobs (candidate_id, offer_id) VALUES (?, ?)',
            [candidateId, offerId]
        );
        return result.insertId;
    }

    // Retirer une offre sauvegardée
    static async delete(candidateId, offerId) {
        const [result] = await db.query(
            'DELETE FROM saved_jobs WHERE candidate_id = ? AND offer_id = ?',
            [candidateId, offerId]
        );
        return result.affectedRows > 0;
    }

    // Vérifier si une offre est déjà sauvegardée
    static async exists(candidateId, offerId) {
        const [rows] = await db.query(
            'SELECT * FROM saved_jobs WHERE candidate_id = ? AND offer_id = ?',
            [candidateId, offerId]
        );
        return rows.length > 0;
    }

    // Récupérer toutes les offres sauvegardées d'un candidat
    static async findByCandidateId(candidateId) {
        try {
            console.log(`🔍 Querying saved jobs for candidate_id: ${candidateId}`);
            
            // D'abord vérifier que saved_jobs contient bien des données pour ce candidat
            const [savedCheck] = await db.query(
                'SELECT * FROM saved_jobs WHERE candidate_id = ? LIMIT 5',
                [candidateId]
            );
            console.log(`📊 Entrées trouvées dans saved_jobs pour candidat ${candidateId}:`, savedCheck);
            
            const [rows] = await db.query(`
                SELECT o.id, o.title, o.date_offer, o.date_expiration,
                       r.company_name, r.industry, r.company_address,
                       req.jobTitle, req.description,
                       req.minSalary as salary_min, req.maxSalary as salary_max, req.salaryType,
                       req.jobType as employment_type, req.jobLevel, req.education as education_level,
                       o.recruiter_id
                FROM saved_jobs sj
                JOIN offers o ON sj.offer_id = o.id
                JOIN recruiters r ON o.recruiter_id = r.id
                LEFT JOIN requirements req ON o.id = req.offer_id
                WHERE sj.candidate_id = ?
                ORDER BY sj.created_at DESC
            `, [candidateId]);
            
            console.log(`📊 Raw query returned ${rows.length} rows`);
            if (rows.length > 0) {
                console.log('📊 First raw row:', JSON.stringify(rows[0], null, 2));
            }
            
            // Mapper les résultats pour garantir la cohérence des données
            const mapped = rows.map(row => ({
                id: row.id,
                recruiter_id: row.recruiter_id,
                title: row.title || row.jobTitle || 'Titre non spécifié',
                date_offer: row.date_offer,
                date_expiration: row.date_expiration,
                company_name: row.company_name || 'Entreprise non spécifiée',
                industry: row.industry,
                description: row.description || '',
                location: row.company_address || '', // Utiliser company_address comme location
                salary_min: row.salary_min,
                salary_max: row.salary_max,
                salary_type: row.salaryType,
                employment_type: row.employment_type || '',
                job_level: row.jobLevel,
                education_level: row.education_level
            }));
            
            console.log(`✅ Mapped ${mapped.length} saved jobs`);
            if (mapped.length > 0) {
                console.log('✅ First mapped job:', JSON.stringify(mapped[0], null, 2));
            }
            return mapped;
        } catch (error) {
            console.error('❌ Error in findByCandidateId:', error);
            console.error('❌ Error stack:', error.stack);
            throw error;
        }
    }

    // Récupérer les IDs des offres sauvegardées d'un candidat
    static async getSavedOfferIds(candidateId) {
        const [rows] = await db.query(
            'SELECT offer_id FROM saved_jobs WHERE candidate_id = ?',
            [candidateId]
        );
        return rows.map(row => row.offer_id);
    }
}

module.exports = SavedJob;

