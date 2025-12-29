require('dotenv').config();
const mysql = require('mysql2');

// Configuration de la connexion à la base de données
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 10000, // 10 seconds timeout
    // SSL configuration for Aiven (required)
    ssl: {
        rejectUnauthorized: false // Aiven uses self-signed certificates
    }
};

// Log configuration (without password)
console.log('🔍 Database Configuration:');
console.log('  Host:', dbConfig.host);
console.log('  Port:', dbConfig.port);
console.log('  User:', dbConfig.user);
console.log('  Database:', dbConfig.database);
console.log('  SSL:', dbConfig.ssl ? 'Enabled' : 'Disabled');

// Création du pool de connexions
const pool = mysql.createPool(dbConfig);

// Promisify pour utiliser async/await
const promisePool = pool.promise();

// Test de connexion avec retry
let retryCount = 0;
const maxRetries = 3;

const testConnection = () => {
    pool.getConnection((err, connection) => {
        if (err) {
            retryCount++;
            console.error(`❌ Erreur de connexion à la base de données (tentative ${retryCount}/${maxRetries}):`, err.message);
            console.error('   Code:', err.code);
            console.error('   Errno:', err.errno);
            
            if (retryCount < maxRetries) {
                console.log(`   Nouvelle tentative dans 5 secondes...`);
                setTimeout(testConnection, 5000);
            } else {
                console.error('   ❌ Échec de connexion après', maxRetries, 'tentatives');
            }
            return;
        }
        console.log('✅ Connexion à la base de données réussie!');
        connection.release();
    });
};

// Start connection test
testConnection();

module.exports = promisePool;
