const Offer = require('../models/Offer');
const Requirement = require('../models/Requirement');
const db = require('../config/database'); // connexion MySQL

exports.createOfferForRecruiter = async (req, res) => {
    try {
        const { recruiterId } = req.params;
        const { title, 
            date_offer, 
            date_expiration,
            // Requirement fields
            jobTitle, tags, jobRole, minSalary, maxSalary, salaryType,
            education, experience, jobType, vacancies, expirationDate, 
            jobLevel, description, responsibilities 
        } = req.body;

        // ==================================================================================
        // 🛑 DÉBUT DE LA VÉRIFICATION DU PACK (LE GENDARME)
        //    NOTE: Bypass possible en mode dev via la variable d'environnement
        //    `BYPASS_SUBSCRIPTION_CHECK=true` (ne pas laisser en production)
        // ==================================================================================

        // If bypass flag set, skip subscription checks entirely (no warnings)
        const warnings = [];

        if (process.env.BYPASS_SUBSCRIPTION_CHECK === 'true') {
            console.log('Bypass subscription check: BYPASS_SUBSCRIPTION_CHECK=true — skipping subscription verification');
            // intentionally skip checking subscriptions so recruiters can post during dev
        } else {
            // 1. On cherche l'abonnement ACTIF et la limite du pack (max_offers)
            const checkSubQuery = `
                SELECT p.job_limit, p.name as pack_name
                FROM recruiter_subscriptions s
                JOIN packs p ON s.pack_id = p.id
                WHERE s.recruiter_id = ? 
                AND s.status = 'active' 
                AND s.end_date > NOW()
                LIMIT 1
            `;
            
            const [subscription] = await db.query(checkSubQuery, [recruiterId]);

            // Si aucun abonnement n'est trouvé
            if (!subscription || subscription.length === 0) {
                return res.status(403).json({
                    status: 'ERROR',
                    message: "Vous devez avoir un abonnement actif pour publier une offre."
                });
            }

            // defensive: if job_limit missing, treat as unlimited (large number)
            const packName = subscription[0].pack_name;
            const limitMaxRaw = subscription[0].job_limit;
            const limitMax = typeof limitMaxRaw === 'number' ? limitMaxRaw : (parseInt(limitMaxRaw, 10) || 999999);

            // 2. On compte combien d'offres ce recruteur a DÉJÀ publiées
            const [countResult] = await db.query(
                "SELECT COUNT(*) as total FROM offers WHERE recruiter_id = ?", 
                [recruiterId]
            );
            
            const currentOffers = countResult[0].total;

            // 3. Comparaison : Si j'ai déjà atteint ma limite, on bloque !
            if (currentOffers >= limitMax) {
                return res.status(403).json({
                    status: 'ERROR',
                    message: `Limite atteinte ! Votre pack '${packName}' autorise ${limitMax} offres. Vous en avez déjà publié ${currentOffers}. Veuillez passer au pack supérieur.`
                });
            }
        }

        // ==================================================================================
        // ✅ FIN DE LA VÉRIFICATION - Si on passe ici, on continue la création normale
        // ==================================================================================

        if (!title) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Le titre est obligatoire'
            });
        }

        // Vérification doublon sur 30 derniers jours
        const [existingOffers] = await db.query(
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

        // Création de l'offre 
        const offerId = await Offer.create({
            recruiter_id: recruiterId,
            title,
            date_offer,
            date_expiration
        });


        // Create Requirement with the offer_id
        const requirementId = await Requirement.create({
            offer_id: offerId,
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
        });


        const newOffer = await Offer.findById(offerId);
        const newRequirement = await Requirement.findById(requirementId);

        res.status(201).json({
            status: 'SUCCESS',
            message: 'Offre créée avec succès',
            data: {
                offer: newOffer,
                requirement: newRequirement,
                warnings: typeof warnings !== 'undefined' ? warnings : []
            }
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
        const offers = await Offer.findByRecruiterId(recruiterId);
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

// Récupérer les détails d'une offre par ID (avec REQUIREMENT)
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

        const requirements = await Requirement.findByOfferId(id);
        res.status(200).json({
            status: 'SUCCESS',
            message: `Détails de l'offre ${id}`,
            data: {
                offer: offer,
                requirement: requirements && requirements.length > 0 ? requirements[0] : null
            }
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
        const { title, date_offer, date_expiration,
            jobTitle, tags, jobRole, minSalary, maxSalary, salaryType,
            education, experience, jobType, vacancies, expirationDate, jobLevel,
            description, responsibilities
        } = req.body;

        // Vérifier que l'offre existe
        const offer = await Offer.findById(id); 
        if (!offer) {
            return res.status(404).json({
                status: 'ERROR',
                message: `Offre avec ID ${id} non trouvée`
            });
        }

        // Convert dates to YYYY-MM-DD format if they come as ISO8601 strings
        const formatDateForMySQL = (dateValue) => {
            if (!dateValue) return null;
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
                return dateValue;
            }
            if (dateValue.includes('T')) {
                return dateValue.split('T')[0];
            }
            return dateValue;
        };

        // Mise à jour de l'offre
        const updated = await Offer.update(id, {
            title: title || offer.title,
            date_offer: formatDateForMySQL(date_offer) || offer.date_offer,
            date_expiration: formatDateForMySQL(date_expiration) || offer.date_expiration
        });

        if (!updated) {
            return res.status(400).json({
                status: "ERROR",
                message: "La mise à jour de l'offre a échoué"
            });
        }

        // Mise à jour du requirement si les données sont fournies
        if (jobTitle !== undefined) {
            const requirements = await Requirement.findByOfferId(id);
            const requirement = requirements && requirements.length > 0 ? requirements[0] : null;
            if (requirement) {
                const requirementUpdated = await Requirement.update(requirement.id, {
                    jobTitle: jobTitle || requirement.jobTitle,
                    tags: tags !== undefined ? tags : requirement.tags,
                    jobRole: jobRole !== undefined ? jobRole : requirement.jobRole,
                    minSalary: minSalary !== undefined ? minSalary : requirement.minSalary,
                    maxSalary: maxSalary !== undefined ? maxSalary : requirement.maxSalary,
                    salaryType: salaryType !== undefined ? salaryType : requirement.salaryType,
                    education: education !== undefined ? education : requirement.education,
                    experience: experience !== undefined ? experience : requirement.experience,
                    jobType: jobType !== undefined ? jobType : requirement.jobType,
                    vacancies: vacancies !== undefined ? vacancies : requirement.vacancies,
                    expirationDate: formatDateForMySQL(expirationDate) || requirement.expirationDate,
                    jobLevel: jobLevel !== undefined ? jobLevel : requirement.jobLevel,
                    description: description !== undefined ? description : requirement.description,
                    responsibilities: responsibilities !== undefined ? responsibilities : requirement.responsibilities
                });

                if (!requirementUpdated) {
                    return res.status(400).json({
                        status: "ERROR",
                        message: "La mise à jour des exigences a échoué"
                    });
                }
            }

            const newOffer = await Offer.findById(id);
            const newRequirements = await Requirement.findByOfferId(id);
            const newRequirement = newRequirements && newRequirements.length > 0 ? newRequirements[0] : null;

            res.status(200).json({
                status: 'SUCCESS',
                message: `Offre ${id} mise à jour`,
                data: {
                    offer: newOffer,
                    requirement: newRequirement
                }
            });
        } else {
            const newOffer = await Offer.findById(id);
            res.status(200).json({
                status: 'SUCCESS',
                message: `Offre ${id} mise à jour`,
                data: {
                    offer: newOffer,
                    requirement: null
                }
            });
        }

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

        const offer = await Offer.findById(id);
        if (!offer) {
            return res.status(404).json({
                status: "ERROR",
                message: `Offre avec ID ${id} non trouvée`
            });
        }

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