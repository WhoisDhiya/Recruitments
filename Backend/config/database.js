require('dotenv').config();
const mysql = require('mysql2');



// Configuration de la connexion à la base de données
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};

// Création du pool de connexions
const pool = mysql.createPool(dbConfig);

// Promisify pour utiliser async/await
const promisePool = pool.promise();

// Test de connexion
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Erreur de connexion à la base de données:', err.message);
        return;
    }
    console.log('✅ Connexion à la base de données réussie!');
    connection.release();
});

module.exports = promisePool;
