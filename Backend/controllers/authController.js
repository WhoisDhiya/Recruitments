const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const dotenv = require('dotenv');
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const Recruiter = require('../models/Recruiter');

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET || 'ma_clé_secrète_ultra_sécurisée';

exports.signup = async (req, res) => {
    try {
        console.log('Signup request received:', req.body);
        
        const { 
            last_name, 
            first_name, 
            email, 
            password, 
            role,
            // Candidate specific fields
            cv,
            image,
            // Recruiter specific fields
            company_name,
            industry,
            description,
            company_email,
            company_address
        } = req.body;
        
        console.log('Extracted fields:', { 
            last_name, first_name, email, role, 
            cv, image, 
            company_name, industry, description, company_email, company_address 
        });

        // Validation des champs requis de base
        if (!last_name || !first_name || !email || !password || !role) {
            return res.status(400).json({ 
                status: 'ERROR', 
                message: 'Tous les champs de base sont requis (last_name, first_name, email, password, role)' 
            });
        }

        // Validation du format email (structure Gmail/email valide)
        // Doit avoir au moins 2 caractères après le point final (ex: .com, .fr, .org)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ 
                status: 'ERROR', 
                message: 'Format d\'email invalide. Veuillez entrer un email valide (ex: exemple@gmail.com)' 
            });
        }

        // Validation du mot de passe
        // Au moins 8 caractères, une majuscule, une minuscule, un chiffre
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ 
                status: 'ERROR', 
                message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre' 
            });
        }

        // Validation du rôle
        const validRoles = ['recruiter', 'candidate', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ 
                status: 'ERROR', 
                message: 'Rôle invalide. Valeurs acceptées: recruiter, candidate, admin' 
            });
        }

        // Validation des champs spécifiques selon le rôle
        if (role === 'candidate') {
            if (!cv || !image) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'Pour les candidats, les champs CV et image sont requis'
                });
            }
        } else if (role === 'recruiter') {
            if (!company_name || !industry || !description || !company_email || !company_address) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'Pour les recruteurs, tous les champs de l\'entreprise sont requis'
                });
            }
            
            // Validation de l'email de l'entreprise
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
            if (!emailRegex.test(company_email.trim())) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'Format d\'email de l\'entreprise invalide. Veuillez entrer un email valide (ex: contact@company.com)'
                });
            }
        }

        // Normaliser l'email (trim et lowercase pour éviter les doublons)
        const normalizedEmail = email.trim().toLowerCase();
        
        // Vérifier si l'email existe déjà
        const existingUser = await User.findByEmail(normalizedEmail);
        if (existingUser) {
            return res.status(409).json({ 
                status: 'ERROR', 
                message: 'Cet email est déjà utilisé' 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Créer l'utilisateur de base
        let userId;
        try {
            userId = await User.create({
                last_name,
                first_name,
                email: normalizedEmail,
                password: hashedPassword,
                role
            });
        } catch (dbError) {
            // Gérer l'erreur MySQL pour les emails dupliqués (code 1062)
            if (dbError.code === 'ER_DUP_ENTRY' || dbError.errno === 1062) {
                return res.status(409).json({ 
                    status: 'ERROR', 
                    message: 'Cet email est déjà utilisé' 
                });
            }
            // Si c'est une autre erreur, la propager
            throw dbError;
        }

        // Créer le profil spécifique selon le rôle
        if (role === 'candidate') {
            console.log('Creating candidate profile with:', { user_id: userId, cv, image });
            const candidateId = await Candidate.create({
                user_id: userId,
                cv: cv || 'default_cv.pdf',
                image: image || 'default_image.jpg'
            });
            console.log('Candidate created with ID:', candidateId);
        } else if (role === 'recruiter') {
            console.log('Creating recruiter profile with:', { 
                user_id: userId, 
                company_name, 
                industry, 
                description, 
                company_email, 
                company_address 
            });
            const recruiterId = await Recruiter.create({
                user_id: userId,
                company_name: company_name,
                industry: industry,
                description: description,
                company_email: company_email,
                company_address: company_address
            });
            console.log('Recruiter created with ID:', recruiterId);
        }

        res.status(201).json({
            status: 'SUCCESS',
            message: 'Utilisateur inscrit avec succès',
            data: {
                user_id: userId,
                email,
                role
            }
        });
    } catch (error) {
        console.error('Erreur signup:', error);
        
        // Gérer spécifiquement les erreurs de duplication d'email
        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
            return res.status(409).json({ 
                status: 'ERROR', 
                message: 'Cet email est déjà utilisé' 
            });
        }
        
        res.status(500).json({ 
            status: 'ERROR', 
            message: "Erreur lors de l'inscription", 
            error: error.message 
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Email et mot de passe sont requis'
            });
        }

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({ 
                status: 'ERROR', 
                message: 'Utilisateur non trouvé' 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                status: 'ERROR', 
                message: 'Mot de passe incorrect' 
            });
        }

        // Vérifier si l'utilisateur admin existe dans la table admins
        if (user.role === 'admin') {
            const Admin = require('../models/Admin');
            const adminProfile = await Admin.findByUserId(user.id);
            if (!adminProfile) {
                return res.status(403).json({
                    status: 'ERROR',
                    message: 'Compte administrateur non configuré. Veuillez contacter le support.'
                });
            }
        }

        // Générer le token JWT
        const token = jwt.sign(
            { user_id: user.id, email: user.email, role: user.role },
            SECRET_KEY,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            status: 'SUCCESS',
            message: 'Connexion réussie',
            data: {
                user: {
                    id: user.id,
                    last_name: user.last_name,
                    first_name: user.first_name,
                    email: user.email,
                    role: user.role
                },
                token: token
            }
        });

    } catch (error) {
        console.error('Erreur login:', error);
        res.status(500).json({ 
            status: 'ERROR', 
            message: "Erreur lors de la connexion", 
            error: error.message 
        });
    }
};

exports.logout = (req, res) => {
    res.status(200).json({
        status: 'SUCCESS',
        message: `Déconnexion réussie pour ${req.user.email}`
    });
};

// Vérifier que l'utilisateur existe toujours (pour vérification au chargement)
exports.verifyUser = async (req, res) => {
    try {
        // req.user est déjà défini par le middleware auth
        const userId = req.user.user_id;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(401).json({
                status: 'ERROR',
                message: 'Utilisateur supprimé. Veuillez vous reconnecter.'
            });
        }
        
        res.status(200).json({
            status: 'SUCCESS',
            message: 'Utilisateur valide',
            data: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Erreur verifyUser:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur lors de la vérification',
            error: error.message
        });
    }
};

// Mettre à jour le profil utilisateur
exports.updateUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { first_name, last_name, email, oldPassword, newPassword } = req.body;

        // Vérifier que l'utilisateur existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Utilisateur non trouvé'
            });
        }

        // Mise à jour des informations de base
        if (first_name !== undefined || last_name !== undefined || email !== undefined) {
            // Vérifier si l'email est modifié et s'il existe déjà
            if (email !== undefined && email !== user.email) {
                const existingUser = await User.findByEmail(email);
                if (existingUser) {
                    return res.status(409).json({
                        status: 'ERROR',
                        message: 'Cet email est déjà utilisé'
                    });
                }
            }

            const updateData = {};
            if (first_name !== undefined) updateData.first_name = first_name;
            if (last_name !== undefined) updateData.last_name = last_name;
            if (email !== undefined) updateData.email = email;

            const updated = await User.updateProfile(userId, updateData);
            if (!updated) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'Erreur lors de la mise à jour du profil'
                });
            }
        }

        // Mise à jour du mot de passe si fourni
        if (oldPassword && newPassword) {
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'Ancien mot de passe incorrect'
                });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await User.updatePassword(userId, hashedPassword);
        }

        // Récupérer l'utilisateur mis à jour
        const updatedUser = await User.findById(userId);

        res.status(200).json({
            status: 'SUCCESS',
            message: 'Profil mis à jour avec succès',
            data: {
                id: updatedUser.id,
                first_name: updatedUser.first_name,
                last_name: updatedUser.last_name,
                email: updatedUser.email,
                role: updatedUser.role
            }
        });

    } catch (error) {
        console.error('Erreur updateUserProfile:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur serveur',
            error: error.message
        });
    }
};
