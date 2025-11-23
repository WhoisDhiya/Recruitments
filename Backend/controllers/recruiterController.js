const Recruiter = require('../models/Recruiter');

// Récupérer tous les recruteurs
exports.getAllRecruiters = async (req, res) => {
    try {
        const recruiters = await Recruiter.findAll();
        
        res.status(200).json({
            status: 'SUCCESS',
            message: 'Liste des recruteurs récupérée avec succès',
            data: recruiters
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des recruteurs:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur lors de la récupération des recruteurs',
            error: error.message
        });
    }
};

// Récupérer le profil complet d'un recruteur par ID
exports.getRecruiterById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const recruiter = await Recruiter.findById(id);
        
        if (!recruiter) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Recruteur non trouvé'
            });
        }

        res.status(200).json({
            status: 'SUCCESS',
            message: 'Profil recruteur récupéré avec succès',
            data: {
                id: recruiter.id,
                user_id: recruiter.user_id,
                last_name: recruiter.last_name,
                first_name: recruiter.first_name,
                email: recruiter.email,
                role: recruiter.role,
                company_name: recruiter.company_name,
                industry: recruiter.industry,
                description: recruiter.description,
                company_email: recruiter.company_email,
                company_address: recruiter.company_address,
                created_at: recruiter.created_at,
                updated_at: recruiter.updated_at
            }
        });

    } catch (error) {
        console.error('Erreur lors de la récupération du profil recruteur:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur lors de la récupération du profil recruteur',
            error: error.message
        });
    }
};

// Récupérer le profil d'un recruteur par user_id
exports.getRecruiterByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const recruiter = await Recruiter.findByUserId(userId);
        
        if (!recruiter) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Recruteur non trouvé'
            });
        }

        res.status(200).json({
            status: 'SUCCESS',
            message: 'Profil recruteur récupéré avec succès',
            data: {
                id: recruiter.id,
                user_id: recruiter.user_id,
                last_name: recruiter.last_name,
                first_name: recruiter.first_name,
                email: recruiter.email,
                role: recruiter.role,
                company_name: recruiter.company_name,
                industry: recruiter.industry,
                description: recruiter.description,
                company_email: recruiter.company_email,
                company_address: recruiter.company_address,
                created_at: recruiter.created_at,
                updated_at: recruiter.updated_at
            }
        });

    } catch (error) {
        console.error('Erreur lors de la récupération du profil recruteur:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur lors de la récupération du profil recruteur',
            error: error.message
        });
    }
};

// Mettre à jour le profil recruteur
exports.updateRecruiter = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            company_name, 
            industry, 
            description, 
            company_email, 
            company_address 
        } = req.body;

        // Validation : au moins un champ doit être fourni
        if (!company_name && !industry && !description && !company_email && !company_address) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Au moins un champ doit être fourni'
            });
        }

        // Vérifier si le recruteur existe
        const recruiter = await Recruiter.findById(id);
        if (!recruiter) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Recruteur non trouvé'
            });
        }

        // Préparer les données à mettre à jour (seulement les champs fournis)
        const updateData = {};
        if (company_name !== undefined) updateData.company_name = company_name;
        if (industry !== undefined) updateData.industry = industry;
        if (description !== undefined) updateData.description = description;
        if (company_email !== undefined) updateData.company_email = company_email;
        if (company_address !== undefined) updateData.company_address = company_address;

        // Mettre à jour
        const updated = await Recruiter.update(id, updateData);
        
        if (!updated) {
            return res.status(500).json({
                status: 'ERROR',
                message: 'Erreur lors de la mise à jour'
            });
        }

        // Récupérer le profil mis à jour
        const updatedRecruiter = await Recruiter.findById(id);

        res.status(200).json({
            status: 'SUCCESS',
            message: 'Profil recruteur mis à jour avec succès',
            data: {
                id: updatedRecruiter.id,
                user_id: updatedRecruiter.user_id,
                company_name: updatedRecruiter.company_name,
                industry: updatedRecruiter.industry,
                description: updatedRecruiter.description,
                company_email: updatedRecruiter.company_email,
                company_address: updatedRecruiter.company_address
            }
        });

    } catch (error) {
        console.error('Erreur lors de la mise à jour du profil recruteur:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur lors de la mise à jour du profil recruteur',
            error: error.message
        });
    }
};

// Récupérer les offres d'un recruteur
exports.getRecruiterOffers = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Vérifier si le recruteur existe
        const recruiter = await Recruiter.findById(id);
        if (!recruiter) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Recruteur non trouvé'
            });
        }

        const offers = await Recruiter.getOffers(id);
        
        res.status(200).json({
            status: 'SUCCESS',
            message: 'Offres du recruteur récupérées avec succès',
            data: offers
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des offres du recruteur:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur lors de la récupération des offres du recruteur',
            error: error.message
        });
    }
};
