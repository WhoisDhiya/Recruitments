const db = require("../config/database");
const Notification = require("../models/Notification");

const createApplication = async (req, res) => {
    try {
        const { offer_id } = req.body;

        if (!offer_id) {
            return res.status(400).json({ message: "offer_id obligatoire" });
        }
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

        // Créer la candidature
        const [insertResult] = await db.query(
            "INSERT INTO applications (candidate_id, offer_id) VALUES (?, ?)",
            [candidateId, offer_id]
        );

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
        const applicationId = req.params.id;

        const userId = req.user.user_id;

        // Trouver l’ID du candidat (table candidates)
        const [candidateRows] = await db.query(
            "SELECT id FROM candidates WHERE user_id = ?",
            [userId]
        );

        if (candidateRows.length === 0) {
            return res.status(400).json({ message: "Ce user n'est pas un candidat" });
        }

        const candidateId = candidateRows[0].id;

        // Chercher la candidature
        const [rows] = await db.query(
            `SELECT a.id, a.status, a.date_application, o.title AS offer_title
             FROM applications a
             JOIN offers o ON o.id = a.offer_id
             WHERE a.id = ? AND a.candidate_id = ?`,
            [applicationId, candidateId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Candidature introuvable" });
        }

        return res.json(rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "ERROR", message: "Erreur serveur", error: err.message });
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
  updateApplicationStatus,
  deleteApplication,
};
