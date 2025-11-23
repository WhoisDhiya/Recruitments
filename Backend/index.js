require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// 🧩 Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔒 Rate limiter pour la création d'offres (anti-spam)
const offerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 4,                  // max 4 requêtes par IP
    message: {
        status: 'ERROR',
        message: 'Trop de requêtes, veuillez réessayer plus tard'
    }
});

// 🧭 Routes
const authRoutes = require('./routes/authRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const recruiterRoutes = require('./routes/recruiterRoutes');
const offerRoutes = require('./routes/offerRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const auth = require('./middleware/auth'); // middleware JWT
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/recruiters', recruiterRoutes);
app.use('/api/admin', adminRoutes);

// Appliquer le rate limiter uniquement sur la création d'offres
app.use('/api/recruiters/:recruiterId/offers', offerLimiter);

app.use('/api', offerRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);


// ✅ Route protégée exemple
app.get('/api/protected', auth, (req, res) => {
    res.json({
        status: 'SUCCESS',
        message: `Bienvenue ${req.user.email}, ceci est une route protégée 🔐`
    });
});

// 🌍 Route racine
app.get('/', (req, res) => {
    res.json({
        message: 'Bienvenue sur l\'API de la plateforme de recrutement',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            candidates: '/api/candidates',
            recruiters: '/api/recruiters',
            offers: '/api/offers',
            applications: '/api/applications',
            protected: '/api/protected'
        }
    });
});

// 🩺 Health check DB
app.get('/api/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({
            status: 'OK',
            message: 'La base de données est connectée',
            database: process.env.DB_NAME
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur de connexion à la base de données',
            error: error.message
        });
    }
});

// 🧪 Test modèles
app.get('/api/test/models', async (req, res) => {
    try {
        const { User, Offer, Application } = require('./models');
        
        const users = await User.findAll();
        const offers = await Offer.findAll();
        const applications = await Application.findAll();
        
        res.json({
            message: 'Modèles fonctionnels',
            data: {
                total_users: users.length,
                total_offers: offers.length,
                total_applications: applications.length
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur lors du test des modèles',
            error: error.message
        });
    }
});

// 🛑 Gestion 404
app.use((req, res) => {
    res.status(404).json({
        status: 'ERROR',
        message: 'Route non trouvée'
    });
});

// 🐞 Gestion globale des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'ERROR',
        message: 'Erreur interne du serveur',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 🚀 Démarrage serveur
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 Serveur démarré avec succès!                          ║
║                                                            ║
║   📍 URL: http://localhost:${PORT}                        ║
║   🌍 Environnement: ${process.env.NODE_ENV || 'development'}                       ║
║   💾 Base de données: ${process.env.DB_NAME || 'recruitment_platform'}              ║
║                                                            ║
║   📚 Documentation: http://localhost:${PORT}/              ║
║   ❤️  Health check: http://localhost:${PORT}/api/health    ║
║   🔐 Route protégée: http://localhost:${PORT}/api/protected║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
