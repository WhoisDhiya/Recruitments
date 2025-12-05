const db = require("../config/database");
const Notification = require("../models/Notification");

const createApplication = async (req, res) => {
    try {
        console.log("📥 Backend: Raw request body:", JSON.stringify(req.body, null, 2));
        const { offer_id, phone, address, portfolio_url, cover_letter, cv_file } = req.body;

        if (!offer_id) {
            return res.status(400).json({ message: "offer_id obligatoire" });
        }
        console.log("📥 Backend: Extracted data:", { 
            offer_id, 
            phone: phone || 'NULL/EMPTY', 
            address: address || 'NULL/EMPTY', 
            portfolio_url: portfolio_url || 'NULL/EMPTY', 
            cover_letter: cover_letter ? cover_letter.substring(0, 50) + '...' : 'NULL/EMPTY' 
        });
        console.log("USER AUTH :", req.user);

        const userId = req.user.user_id; // ID de la table users
        console.log("USER AUTH :", userId);

        // Chercher le vrai ID du candidat dans la table candidates
        const [rows] = await db.query(
            "SELECT id FROM candidates WHERE user_id = ?",
            [userId]
        );

        if (rows.length === 0) {
            return res.status(400).json({ message: "Ce user n'est pas un candidat" });
        }

        const candidateId = rows[0].id;

        // Validation du numéro de téléphone si fourni
        if (phone !== undefined && phone !== null && String(phone).trim() !== '') {
            const phoneStr = String(phone).trim();
            // Supprimer les espaces, tirets, parenthèses et points pour la validation
            const cleanedPhone = phoneStr.replace(/[\s\-\(\)\.]/g, '');
            const digitsOnly = cleanedPhone.replace(/\D/g, '');
            
            // Vérifier que le numéro contient entre 8 et 15 chiffres
            if (digitsOnly.length < 8 || digitsOnly.length > 15) {
                return res.status(400).json({ 
                    message: "Format de numéro de téléphone invalide. Le numéro doit contenir entre 8 et 15 chiffres (ex: +216 23 235 891 ou 0123456789)" 
                });
            }
            
            // Vérifier le format général (accepte les formats internationaux et locaux)
            const phoneRegex = /^(\+?\d{1,4}[\s\-]?)?(\(?\d{1,4}\)?[\s\-]?)?[\d\s\-]{8,15}$/;
            if (!phoneRegex.test(phoneStr)) {
                return res.status(400).json({ 
                    message: "Format de numéro de téléphone invalide. Veuillez entrer un numéro valide (ex: +216 23 235 891 ou 0123456789)" 
                });
            }
        }

        // Normaliser les valeurs : convertir les chaînes vides en null
        // Vérifier d'abord si les valeurs existent et ne sont pas undefined
        // S'assurer que les valeurs sont bien des chaînes avant de les trimmer
        const normalizedPhone = (phone !== undefined && phone !== null && String(phone).trim() !== '') ? String(phone).trim() : null;
        const normalizedAddress = (address !== undefined && address !== null && String(address).trim() !== '') ? String(address).trim() : null;
        const normalizedPortfolio = (portfolio_url !== undefined && portfolio_url !== null && String(portfolio_url).trim() !== '') ? String(portfolio_url).trim() : null;
        const normalizedCoverLetter = (cover_letter !== undefined && cover_letter !== null && String(cover_letter).trim() !== '') ? String(cover_letter).trim() : null;
        // Le CV est envoyé en base64 (data URI format: "data:application/pdf;base64,...")
        const normalizedCvFile = (cv_file !== undefined && cv_file !== null && String(cv_file).trim() !== '') ? String(cv_file).trim() : null;

        console.log("💾 Backend: Saving application with normalized data:", {
            candidateId,
            offer_id,
            phone: normalizedPhone,
            address: normalizedAddress,
            portfolio_url: normalizedPortfolio,
            cover_letter: normalizedCoverLetter ? normalizedCoverLetter.substring(0, 50) + '...' : null
        });
        console.log("🔍 Backend: Data types check:", {
            phone_type: typeof phone,
            address_type: typeof address,
            portfolio_type: typeof portfolio_url,
            cover_letter_type: typeof cover_letter
        });

        // Créer la candidature avec tous les champs
        console.log("🔍 Backend: About to INSERT with values:", {
            candidateId,
            offer_id,
            phone: normalizedPhone,
            address: normalizedAddress,
            portfolio_url: normalizedPortfolio,
            cover_letter: normalizedCoverLetter ? normalizedCoverLetter.substring(0, 30) + '...' : null
        });
        
        const [insertResult] = await db.query(
            "INSERT INTO applications (candidate_id, offer_id, phone, address, portfolio_url, cover_letter, cv_file) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [candidateId, offer_id, normalizedPhone, normalizedAddress, normalizedPortfolio, normalizedCoverLetter, normalizedCvFile]
        );

        console.log("✅ Backend: Application created with ID:", insertResult.insertId);
        console.log("✅ Backend: Insert result:", JSON.stringify(insertResult, null, 2));
        
        // Vérifier que les données ont bien été sauvegardées
        const [verifyRows] = await db.query(
            "SELECT id, candidate_id, offer_id, phone, address, portfolio_url, cover_letter FROM applications WHERE id = ?",
            [insertResult.insertId]
        );
        console.log("🔍 Backend: Verification - Saved data from DB:", JSON.stringify(verifyRows[0], null, 2));
        
        if (!verifyRows[0]) {
            console.error("❌ Backend: ERROR - Application was not found after insertion!");
        } else {
            console.log("✅ Backend: Data verification successful!");
        }

        // Récupérer le user_id et email du recruteur propriétaire de l'offre
        const [ownerRows] = await db.query(
            `SELECT u.id AS user_id, u.email, o.title 
             FROM offers o
             JOIN recruiters r ON r.id = o.recruiter_id
             JOIN users u ON u.id = r.user_id
             WHERE o.id = ?`,
            [offer_id]
        );

        if (ownerRows.length) {
            const owner = ownerRows[0];
            // Créer une notification "unread" pour le recruteur
            await Notification.create({
                user_id: owner.user_id,
                application_id: insertResult.insertId,
                email: owner.email,
                subject: "Nouvelle candidature reçue",
                message: `Vous avez reçu une nouvelle candidature pour l'offre "${owner.title}".`
            });
        }

        return res.json({ message: "Candidature créée avec succès" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "ERROR",
            message: "Erreur serveur",
            error: err.message
        });
    }
};

const getApplicationById = async (req, res) => {
    try {
        // Vérifier que l'utilisateur est authentifié
        if (!req.user || !req.user.user_id) {
            console.error('❌ Backend: User not authenticated');
            return res.status(401).json({ status: "ERROR", message: "Non authentifié" });
        }
        
        const applicationId = req.params.id;
        const userId = req.user.user_id;
        
        console.log('🔍 Backend: getApplicationById called with applicationId:', applicationId, 'userId:', userId);

        // Trouver l'ID du candidat (table candidates)
        const [candidateRows] = await db.query(
            "SELECT id FROM candidates WHERE user_id = ?",
            [userId]
        );

        if (candidateRows.length === 0) {
            return res.status(400).json({ status: "ERROR", message: "Ce user n'est pas un candidat" });
        }

        const candidateId = candidateRows[0].id;
        console.log('✅ Backend: Candidate ID found:', candidateId);

        // Chercher la candidature avec tous les détails
        // Récupérer directement les valeurs de la table applications (phone, address, etc.)
        console.log('🔍 Backend: Executing SQL query for application:', applicationId);
        const [rows] = await db.query(
            `SELECT 
                a.id,
                a.status,
                a.date_application,
                a.phone,
                a.address,
                a.portfolio_url,
                a.cover_letter,
                a.cv_file,
                a.offer_id,
                o.title AS offer_title,
                req.description AS offer_description,
                rec.company_address AS offer_location,
                req.minSalary AS salary_min,
                req.maxSalary AS salary_max,
                req.salaryType AS salary_type,
                req.jobType,
                req.jobLevel,
                rec.company_name,
                c.cv,
                c.image,
                u.first_name,
                u.last_name,
                u.email
             FROM applications a
             JOIN offers o ON o.id = a.offer_id
             JOIN recruiters rec ON rec.id = o.recruiter_id
             LEFT JOIN requirements req ON req.offer_id = o.id
             JOIN candidates c ON c.id = a.candidate_id
             JOIN users u ON u.id = c.user_id
             WHERE a.id = ? AND a.candidate_id = ?
             LIMIT 1`,
            [applicationId, candidateId]
        );
        
        console.log('✅ Backend: SQL query executed successfully, rows found:', rows.length);

        if (rows.length === 0) {
            console.log(`❌ Backend: Application ${applicationId} not found for candidate ${candidateId}`);
            return res.status(404).json({ status: "ERROR", message: "Candidature introuvable" });
        }

        console.log(`✅ Backend: Application ${applicationId} found, returning data`);
        console.log('Backend: rows[0] keys:', Object.keys(rows[0]));
        console.log('Backend: rows[0] full data:', JSON.stringify(rows[0], null, 2));
        console.log('Backend: phone value:', rows[0].phone, 'type:', typeof rows[0].phone, 'exists:', 'phone' in rows[0]);
        console.log('Backend: address value:', rows[0].address, 'type:', typeof rows[0].address, 'exists:', 'address' in rows[0]);
        console.log('Backend: portfolio_url value:', rows[0].portfolio_url, 'type:', typeof rows[0].portfolio_url, 'exists:', 'portfolio_url' in rows[0]);
        console.log('Backend: cover_letter value:', rows[0].cover_letter ? rows[0].cover_letter.substring(0, 50) + '...' : 'NULL', 'type:', typeof rows[0].cover_letter, 'exists:', 'cover_letter' in rows[0]);
        console.log('Backend: email value:', rows[0].email, 'type:', typeof rows[0].email, 'exists:', 'email' in rows[0]);
        console.log('Backend: cv value:', rows[0].cv, 'type:', typeof rows[0].cv, 'exists:', 'cv' in rows[0]);

        // Construire l'objet de réponse avec toutes les données
        // Gérer correctement les valeurs NULL et les chaînes vides
        const row = rows[0];
        
        // Fonction helper pour convertir en nombre de manière sécurisée
        const safeParseFloat = (value) => {
            if (value === null || value === undefined || value === '') return null;
            const parsed = parseFloat(value);
            return isNaN(parsed) ? null : parsed;
        };
        
        // Fonction helper pour convertir en string de manière sécurisée
        const safeString = (value) => {
            if (value === null || value === undefined) return null;
            const str = String(value);
            return str.trim() === '' ? null : str;
        };
        
        const applicationData = {
            id: row.id ?? null,
            status: row.status ?? null,
            date_application: row.date_application ?? null,
            // Les champs de l'application - peuvent être NULL ou des chaînes vides
            phone: safeString(row.phone),
            address: safeString(row.address),
            portfolio_url: safeString(row.portfolio_url),
            cover_letter: safeString(row.cover_letter),
            cv_file: safeString(row.cv_file),
            // Informations sur l'offre
            offer_id: row.offer_id ?? null,
            offer_title: row.offer_title ?? null,
            offer_description: safeString(row.offer_description),
            offer_location: safeString(row.offer_location),
            // Informations sur le salaire (peuvent être NULL si pas de requirement)
            salary_min: safeParseFloat(row.salary_min),
            salary_max: safeParseFloat(row.salary_max),
            salary_type: row.salary_type ?? null,
            jobType: row.jobType ?? null,
            jobLevel: row.jobLevel ?? null,
            // Informations sur l'entreprise
            company_name: row.company_name ?? null,
            // Informations sur le candidat
            cv: safeString(row.cv),
            image: safeString(row.image),
            first_name: row.first_name ?? null,
            last_name: row.last_name ?? null,
            email: row.email ?? null
        };

        const responseData = {
            status: "SUCCESS",
            data: applicationData
        };

        console.log('Backend: Response structure:', JSON.stringify(responseData, null, 2));

        return res.status(200).json(responseData);

    } catch (err) {
        console.error('❌ Error in getApplicationById:', err);
        console.error('Error stack:', err.stack);
        console.error('Error message:', err.message);
        res.status(500).json({ 
            status: "ERROR", 
            message: "Erreur serveur", 
            error: err.message,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

// Récupérer les détails d'une candidature (côté recruteur)
const getApplicationDetailsForRecruiter = async (req, res) => {
    try {
        // Convertir l'ID en nombre (les paramètres d'URL sont des strings)
        const applicationId = parseInt(req.params.id, 10);
        const userRole = req.user.role;
        const userId = req.user.user_id;

        console.log('🔍 Backend: getApplicationDetailsForRecruiter called', {
            applicationId,
            applicationIdType: typeof applicationId,
            rawParam: req.params.id,
            userRole,
            userId
        });

        // Vérifier que l'ID est valide
        if (isNaN(applicationId) || applicationId <= 0) {
            console.error('❌ Backend: Invalid application ID:', req.params.id);
            return res.status(400).json({ status: "ERROR", message: "ID de candidature invalide" });
        }

        if (userRole !== "recruiter") {
            console.error('❌ Backend: User is not a recruiter');
            return res.status(403).json({ status: "ERROR", message: "Accès refusé : réservé aux recruteurs" });
        }

        const [recruiterRows] = await db.query(
            "SELECT id FROM recruiters WHERE user_id = ?",
            [userId]
        );

        if (recruiterRows.length === 0) {
            console.error('❌ Backend: Recruiter not found for user_id:', userId);
            return res.status(400).json({ status: "ERROR", message: "Ce user n'est pas un recruteur" });
        }

        const recruiterId = recruiterRows[0].id;
        console.log('✅ Backend: Recruiter ID found:', recruiterId);
        console.log('🔍 Backend: Searching for application:', applicationId, 'for recruiter:', recruiterId);

        // D'abord, vérifier si l'application existe
        const [appCheck] = await db.query(
            "SELECT id, offer_id, candidate_id FROM applications WHERE id = ?",
            [applicationId]
        );

        if (appCheck.length === 0) {
            console.error('❌ Backend: Application not found:', applicationId);
            return res.status(404).json({ status: "ERROR", message: "Candidature introuvable" });
        }

        console.log('✅ Backend: Application found:', appCheck[0]);

        // Vérifier si l'offre appartient au recruteur
        const [offerCheck] = await db.query(
            "SELECT id, recruiter_id FROM offers WHERE id = ?",
            [appCheck[0].offer_id]
        );

        if (offerCheck.length === 0) {
            console.error('❌ Backend: Offer not found:', appCheck[0].offer_id);
            return res.status(404).json({ status: "ERROR", message: "Offre introuvable" });
        }

        if (offerCheck[0].recruiter_id !== recruiterId) {
            console.error('❌ Backend: Offer does not belong to recruiter. Offer recruiter_id:', offerCheck[0].recruiter_id, 'Current recruiter_id:', recruiterId);
            return res.status(403).json({ status: "ERROR", message: "Cette candidature n'appartient pas à vos offres" });
        }

        console.log('✅ Backend: Offer belongs to recruiter, fetching full details...');
        console.log('🔍 Backend: Executing final query with applicationId:', applicationId, 'recruiterId:', recruiterId);

        const [rows] = await db.query(`
            SELECT 
                a.id,
                a.status,
                a.date_application,
                a.phone,
                a.address,
                a.portfolio_url,
                a.cover_letter,
                a.cv_file,
                o.id AS offer_id,
                o.title AS offer_title,
                req.description AS offer_description,
                r.company_address AS offer_location,
                req.minSalary AS salary_min,
                req.maxSalary AS salary_max,
                req.salaryType AS salary_type,
                req.jobType,
                req.jobLevel,
                c.id AS candidate_id,
                c.cv,
                c.image,
                u.first_name AS candidate_first_name,
                u.last_name AS candidate_last_name,
                u.email AS candidate_email,
                r.company_name
            FROM applications a
            JOIN offers o ON o.id = a.offer_id
            JOIN recruiters r ON r.id = o.recruiter_id
            LEFT JOIN requirements req ON req.offer_id = o.id
            JOIN candidates c ON c.id = a.candidate_id
            JOIN users u ON u.id = c.user_id
            WHERE a.id = ? AND r.id = ?
            LIMIT 1
        `, [applicationId, recruiterId]);

        console.log('🔍 Backend: Query result, rows found:', rows.length);
        if (rows.length > 0) {
            console.log('✅ Backend: Query successful, application data keys:', Object.keys(rows[0]));
        } else {
            console.error('❌ Backend: Query returned no rows. Checking why...');
            // Vérification supplémentaire pour déboguer
            const [debugCheck] = await db.query(`
                SELECT a.id, a.offer_id, o.recruiter_id, r.id AS recruiter_table_id
                FROM applications a
                JOIN offers o ON o.id = a.offer_id
                JOIN recruiters r ON r.id = o.recruiter_id
                WHERE a.id = ?
            `, [applicationId]);
            console.log('🔍 Backend: Debug check result:', debugCheck);
        }

        if (rows.length === 0) {
            console.error('❌ Backend: No rows returned from query');
            return res.status(404).json({ status: "ERROR", message: "Candidature introuvable pour ce recruteur" });
        }

        console.log('✅ Backend: Application details retrieved successfully');
        console.log('📋 Backend: Application data keys:', Object.keys(rows[0]));

        return res.status(200).json({
            status: "SUCCESS",
            data: rows[0]
        });
    } catch (error) {
        console.error("Erreur récupération détails candidature:", error);
        res.status(500).json({
            status: "ERROR",
            message: "Erreur lors de la récupération des détails de la candidature",
            error: error.message
        });
    }
};
const updateApplicationStatus = async (req, res) => {
    try {
        const applicationId = req.params.id;
        const { status } = req.body;
        const userRole = req.user.role;
        const userId = req.user.user_id;

        // 1. Vérifier que c’est un recruteur
        if (userRole !== "recruiter") {
            return res.status(403).json({ message: "Accès refusé : réservé aux recruteurs" });
        }

        // 2. Récupérer recruiter_id via table recruiters
        console.log('🔍 Checking application update - User ID:', userId, 'Application ID:', applicationId);
        const [recRows] = await db.query(
            "SELECT id FROM recruiters WHERE user_id = ?",
            [userId]
        );

        if (recRows.length === 0) {
            console.error('❌ User is not a recruiter:', userId);
            return res.status(400).json({ message: "Ce user n'est pas un recruteur" });
        }

        const recruiterId = recRows[0].id;
        console.log('✅ Recruiter ID found:', recruiterId);

        // 3. Vérifier que la candidature appartient à une offre du recruteur
        // Amélioration : récupérer plus d'infos pour le débogage
        const [appRows] = await db.query(
            `SELECT a.id, a.offer_id, o.recruiter_id, o.title
             FROM applications a
             JOIN offers o ON o.id = a.offer_id
             WHERE a.id = ?`,
            [applicationId]
        );

        console.log('🔍 Application details:', appRows);

        if (appRows.length === 0) {
            console.error('❌ Application not found:', applicationId);
            return res.status(404).json({
                message: "Candidature introuvable"
            });
        }

        const application = appRows[0];
        console.log('🔍 Application offer recruiter_id:', application.recruiter_id, 'vs Current recruiter_id:', recruiterId);

        if (application.recruiter_id !== recruiterId) {
            console.error('❌ Permission denied - Application belongs to recruiter:', application.recruiter_id, 'but current user is:', recruiterId);
            return res.status(403).json({
                message: "Vous ne pouvez modifier que les candidatures de vos propres offres"
            });
        }

        console.log('✅ Permission granted - Application belongs to this recruiter');

        // 4. Vérifier statut valide
        const validStatus = ["pending", "accepted", "rejected"];

        if (!validStatus.includes(status)) {
            return res.status(400).json({
                message: "Statut invalide (pending / accepted / rejected)"
            });
        }

        // 5. Mise à jour
        await db.query(
            "UPDATE applications SET status = ? WHERE id = ?",
            [status, applicationId]
        );

        // 6. Récupérer les infos candidat et offre pour notifier le candidat
        const [candidateInfoRows] = await db.query(
            `SELECT u.id AS user_id, u.email, o.title 
             FROM applications a
             JOIN candidates c ON c.id = a.candidate_id
             JOIN users u ON u.id = c.user_id
             JOIN offers o ON o.id = a.offer_id
             WHERE a.id = ?`,
            [applicationId]
        );

        if (candidateInfoRows.length) {
            const info = candidateInfoRows[0];
            console.log('📧 Candidate info for notification:', info);
            
            // Messages en français selon le statut
            let subject = '';
            let message = '';
            
            if (status === 'accepted') {
                subject = '🎉 Candidature acceptée !';
                message = `Félicitations ! Votre candidature pour le poste "${info.title}" a été acceptée. Le recruteur vous contactera prochainement.`;
            } else if (status === 'rejected') {
                subject = '❌ Candidature refusée';
                message = `Votre candidature pour le poste "${info.title}" a été refusée. Ne vous découragez pas et continuez vos recherches !`;
            } else if (status === 'pending') {
                subject = '⏳ Candidature en attente';
                message = `Votre candidature pour le poste "${info.title}" est en attente d'examen. Vous serez notifié dès qu'une décision sera prise.`;
            } else if (status === 'reviewed') {
                subject = '👀 Candidature en cours d\'examen';
                message = `Votre candidature pour le poste "${info.title}" est en cours d'examen. Vous serez notifié dès qu'une décision sera prise.`;
            } else {
                subject = `Statut candidature: ${status}`;
                message = `Le statut de votre candidature pour "${info.title}" a été mis à jour.`;
            }
            
            try {
                const notificationId = await Notification.create({
                    user_id: info.user_id,
                    application_id: applicationId,
                    email: info.email,
                    subject: subject,
                    message: message
                });
                
                console.log(`✅ Notification créée avec succès (ID: ${notificationId}) pour le candidat ${info.user_id} (${info.email}) - Candidature ${applicationId} (statut: ${status})`);
            } catch (notifError) {
                console.error('❌ Erreur lors de la création de la notification:', notifError);
                // Ne pas bloquer la mise à jour du statut si la notification échoue
            }
        } else {
            console.warn('⚠️ Aucune information candidat trouvée pour la candidature:', applicationId);
        }

        return res.json({ message: "Statut mis à jour avec succès" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "ERROR",
            message: "Erreur serveur",
            error: err.message
        });
    }
};
const deleteApplication = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const userId = req.user.user_id;

    // 1. Vérifier que c'est un candidat
    if (req.user.role !== "candidate") {
      return res.status(403).json({ message: "Seul le candidat peut annuler sa candidature" });
    }

    // 2. Récupérer l'ID du candidat
    const [candidateRows] = await db.query(
      "SELECT id FROM candidates WHERE user_id = ?",
      [userId]
    );

    if (candidateRows.length === 0) {
      return res.status(400).json({ message: "Ce user n'est pas un candidat" });
    }

    const candidateId = candidateRows[0].id;

    // 3. Vérifier que la candidature appartient au candidat
    const [appRows] = await db.query(
      "SELECT id FROM applications WHERE id = ? AND candidate_id = ?",
      [applicationId, candidateId]
    );

    if (appRows.length === 0) {
      return res.status(404).json({ message: "Candidature introuvable ou non autorisée" });
    }

    // 4. Supprimer la candidature
    await db.query("DELETE FROM applications WHERE id = ?", [applicationId]);

    return res.json({ message: "Candidature annulée avec succès" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "ERROR", message: "Erreur serveur", error: err.message });
  }
};

module.exports = {
  createApplication,
  getApplicationById,
  getApplicationDetailsForRecruiter,
  updateApplicationStatus,
  deleteApplication,
};
