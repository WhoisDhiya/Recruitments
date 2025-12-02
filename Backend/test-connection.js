require('dotenv').config();
const mysql = require('mysql2');

console.log('🔍 Test de connexion MySQL...\n');
console.log('Configuration:');
console.log('  Host:', process.env.DB_HOST || 'Non défini');
console.log('  User:', process.env.DB_USER || 'Non défini');
console.log('  Database:', process.env.DB_NAME || 'Non défini');
console.log('  Port:', process.env.DB_PORT || '3306');
console.log();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Erreur de connexion MySQL:', err.message);
        console.error('\n📋 Solutions possibles:');
        console.error('  1. Vérifiez que MySQL est démarré');
        console.error('  2. Vérifiez les identifiants dans le fichier .env');
        console.error('  3. Créez la base de données: mysql -u root -p < database/schema.sql');
        process.exit(1);
    }
    
    console.log('✅ Connexion MySQL réussie!');
    console.log('✅ Base de données:', process.env.DB_NAME);
    
    connection.query('SHOW TABLES', (error, results) => {
        if (error) {
            console.error('❌ Erreur lors de la récupération des tables:', error.message);
        } else {
            console.log('\n📊 Tables dans la base de données:');
            if (results.length === 0) {
                console.log('  ⚠️  Aucune table trouvée. Exécutez: mysql -u root -p < database/schema.sql');
            } else {
                results.forEach(row => {
                    console.log('  ✓', Object.values(row)[0]);
                });
            }
        }
        
        connection.end();
        console.log('\n✅ Test terminé avec succès!');
    });
});

