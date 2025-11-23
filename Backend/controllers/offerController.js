const Offer = require('../models/Offer');
const db = require('../config/database'); // connexion MySQL

exports.createOfferForRecruiter = async (req, res) => {
    try {
        const { recruiterId } = req.params;
        const { title, description, location, type, salary } = req.body;

        if (!title) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Le titre est obligatoire'
            });
        }

        // Vérification doublon sur 30 derniers jours
        const [existingOffers] = await db.execute(
            `SELECT * FROM offers 
             WHERE recruiter_id = ? 
             AND title = ? 
             AND date_offer >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
            [recruiterId, title]
        );

        if (existingOffers.length > 0) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Cette offre a déjà été publiée récemment'
            });
        }

        // Création de l'offre (ton code original)
        const offerId = await Offer.create({
            recruiter_id: recruiterId,
            title,
            description,
            location,
            type,
            salary,
            date_offer: new Date()
        });

        const newOffer = await Offer.findById(offerId);

        res.status(201).json({
            status: 'SUCCESS',
            message: 'Offre créée avec succès',
            data: newOffer
        });

    } catch (error) {
        console.error('Erreur création offre:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur serveur',
            error: error.message
        });
    }

};
// Récupérer toutes les offres
exports.getAllOffers = async (req, res) => {
    try {
        const offers = await Offer.findAll(); // Récupère toutes les offres depuis la base
        res.status(200).json({
            status: 'SUCCESS',
            message: 'Liste des offres',
            data: offers
        });
    } catch (error) {
        console.error('Erreur récupération offres :', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

exports.getOffersByRecruiter = async (req, res) => {
    try {
        const { recruiterId } = req.params;
        const offers = await Offer.findAll({
            where: { recruiter_id: recruiterId }
        });
        res.status(200).json({
            status: 'SUCCESS',
            message: `Liste des offres du recruteur ${recruiterId}`,
            data: offers
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur serveur',
            error: error.message
        });
    }
};
// Récupérer les détails d'une offre par ID
exports.getOfferById = async (req, res) => {
    try {
        const { id } = req.params;

        // Requête personnalisée selon ton modèle MySQL
        const offer = await Offer.findById(id); 

        if (!offer) {
            return res.status(404).json({
                status: 'ERROR',
                message: `Offre avec ID ${id} non trouvée`
            });
        }

        res.status(200).json({
            status: 'SUCCESS',
            message: `Détails de l'offre ${id}`,
            data: offer
        });

    } catch (error) {
        console.error('Erreur récupération offre :', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// Modifier une offre par ID
exports.updateOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, location, type, salary, date_offer, date_expiration } = req.body;

        // Vérifier que l'offre existe
        const offer = await Offer.findById(id);  // ✅ Correction ici
        if (!offer) {
            return res.status(404).json({
                status: 'ERROR',
                message: `Offre avec ID ${id} non trouvée`
            });
        }

        // Mise à jour
        const updated = await Offer.update(id, {
            title: title || offer.title,
            date_offer: date_offer || offer.date_offer,
            date_expiration: date_expiration || offer.date_expiration
        });

        if (!updated) {
            return res.status(400).json({
                status: "ERROR",
                message: "La mise à jour a échoué"
            });
        }

        const newOffer = await Offer.findById(id);

        res.status(200).json({
            status: 'SUCCESS',
            message: `Offre ${id} mise à jour`,
            data: newOffer
        });

    } catch (error) {
        console.error('Erreur modification offre :', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur serveur',
            error: error.message
        });
    }
};



// Supprimer une offre par ID
exports.deleteOffer = async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier que l'offre existe
        const offer = await Offer.findById(id);
        if (!offer) {
            return res.status(404).json({
                status: "ERROR",
                message: `Offre avec ID ${id} non trouvée`
            });
        }

        // Vérifier s'il existe des candidatures pour cette offre
        const applications = await Offer.getApplications(id);
        if (applications.length > 0) {
            return res.status(400).json({
                status: "ERROR",
                message: "Impossible de supprimer cette offre : elle possède déjà des candidatures."
            });
        }

        // Supprimer l'offre si aucune candidature
        const deleted = await Offer.delete(id);
        if (!deleted) {
            return res.status(400).json({
                status: "ERROR",
                message: "La suppression a échoué"
            });
        }

        res.status(200).json({
            status: "SUCCESS",
            message: `Offre ${id} supprimée avec succès`
        });

    } catch (error) {
        console.error("Erreur suppression offre :", error);
        res.status(500).json({
            status: "ERROR",
            message: "Erreur serveur",
            error: error.message
        });
    }
};

//Récupérer les candidatures d'une offre
exports.getApplicationsByOffer = async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier que l'offre existe
        const offer = await Offer.findById(id);
        if (!offer) {
            return res.status(404).json({
                status: "ERROR",
                message: `Offre avec ID ${id} non trouvée`
            });
        }

        // Récupérer les candidatures
        const applications = await Offer.getApplications(id);

        res.status(200).json({
            status: "SUCCESS",
            message: `Liste des candidatures pour l'offre ${id}`,
            data: applications
        });

    } catch (error) {
        console.error("Erreur récupération candidatures :", error);
        res.status(500).json({
            status: "ERROR",
            message: "Erreur serveur",
            error: error.message
        });
    }
};



