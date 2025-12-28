require('dotenv').config();
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('CLIENT_URL:', process.env.CLIENT_URL);
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const db = require('./config/database');

// Stripe / Payments are optional and can be disabled durant development
let stripe = null;
const hasStripeKey = !!process.env.STRIPE_SECRET_KEY;
const paymentsDisabled = process.env.DISABLE_PAYMENTS === 'true' || !hasStripeKey;

if (paymentsDisabled) {
    const reason = !hasStripeKey ? 'STRIPE_SECRET_KEY is not set' : 'DISABLE_PAYMENTS=true';
    console.log(`Payments disabled: ${reason}`);
} else {
    try {
        stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        console.log('Payments enabled: Stripe initialized');
    } catch (err) {
        console.warn('Stripe not initialized:', err && err.message ? err.message : err);
        stripe = null;
    }
}



const app = express();
const PORT = process.env.PORT || 3000;

// Ensure pending_recruiters table exists (safe idempotent migration at startup)
const ensurePendingTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS pending_recruiters (
                id INT AUTO_INCREMENT PRIMARY KEY,
                last_name VARCHAR(255) NOT NULL,
                first_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                hashed_password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'recruiter',
                company_name VARCHAR(255),
                industry VARCHAR(255),
                description TEXT,
                company_email VARCHAR(255),
                company_address VARCHAR(255),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('✅ Pending recruiters table ensured');
    } catch (err) {
        console.error('Failed to ensure pending_recruiters table:', err && err.message ? err.message : err);
    }
};

// Ensure saved_jobs table exists (safe idempotent migration at startup)
const ensureSavedJobsTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS saved_jobs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                candidate_id INT NOT NULL,
                offer_id INT NOT NULL,
                saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_saved_job (candidate_id, offer_id),
                FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
                FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('✅ Saved jobs table ensured');
    } catch (err) {
        console.error('Failed to ensure saved_jobs table:', err && err.message ? err.message : err);
    }
};

// Ensure packs table exists (safe idempotent migration at startup)
const ensurePacksTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS packs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                price DECIMAL(10,2) NOT NULL DEFAULT 0,
                job_limit INT NOT NULL DEFAULT 0,
                candidate_limit INT NOT NULL DEFAULT 0,
                visibility_days INT NOT NULL DEFAULT 30,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        
        // Seed default packs if they don't exist
        const [packs] = await db.query('SELECT COUNT(*) as count FROM packs');
        if (packs[0].count === 0) {
            await db.query(`
                INSERT INTO packs (name, price, job_limit, candidate_limit, visibility_days, description)
                VALUES 
                ('basic', 0.00, 3, 100, 30, 'Pack de base - 3 offres'),
                ('standard', 29.99, 10, 500, 60, 'Pack standard - 10 offres'),
                ('premium', 79.99, 999, 5000, 365, 'Pack premium - offres illimitées');
            `);
            console.log('✅ Default packs seeded');
        } else {
            console.log('✅ Packs table ensured');
        }
    } catch (err) {
        console.error('Failed to ensure packs table:', err && err.message ? err.message : err);
    }
};

// Ensure recruiter_subscriptions table exists (safe idempotent migration at startup)
const ensureSubscriptionsTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS recruiter_subscriptions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                recruiter_id INT NOT NULL,
                pack_id INT NOT NULL,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                status ENUM('active','inactive','cancelled','expired') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (recruiter_id) REFERENCES recruiters(id) ON DELETE CASCADE,
                FOREIGN KEY (pack_id) REFERENCES packs(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('✅ Recruiter subscriptions table ensured');
    } catch (err) {
        console.error('Failed to ensure subscriptions table:', err && err.message ? err.message : err);
    }
};

ensurePendingTable();
ensureSavedJobsTable();
ensurePacksTable();
ensureSubscriptionsTable();

// 🧩 Middlewares
// CORS configuration - accept requests from frontend URL
const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5173', // Dev fallback
    'http://localhost:3000'  // Dev fallback
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true,limit:'100mb' }));

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

const paymentRoutes = require('./routes/paymentRoutes');

const auth = require('./middleware/auth'); // middleware JWT
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/recruiters', recruiterRoutes);
app.use('/api/admin', adminRoutes);
// Mount payment routes
// Note: getPacks route is always available, but payment routes require Stripe
app.use('/api/payments', paymentRoutes);

// Appliquer le rate limiter uniquement sur la création d'offres
app.use('/api/recruiters/:recruiterId/offers', offerLimiter);

app.use('/api', offerRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/saved-jobs', require('./routes/savedJobRoutes'));


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

// 🔄 Route de redirection pour payment-success (Stripe redirige ici)
app.get('/payment-success', (req, res) => {
    const sessionId = req.query.session_id;
    // Force l'URL du frontend pour éviter les boucles de redirection
    const frontendUrl = 'http://localhost:5173';
    console.log('🔄 Redirecting payment-success to frontend:', frontendUrl, '| Session ID:', sessionId);
    if (sessionId) {
        res.redirect(`${frontendUrl}/payment-success?session_id=${sessionId}`);
    } else {
        res.redirect(`${frontendUrl}/payment-success`);
    }
});

// 🔄 Route de redirection pour payment-cancel
app.get('/payment-cancel', (req, res) => {
    // Force l'URL du frontend pour éviter les boucles de redirection
    const frontendUrl = 'http://localhost:5173';
    console.log('🔄 Redirecting payment-cancel to frontend:', frontendUrl);
    res.redirect(`${frontendUrl}/payment-cancel`);
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
