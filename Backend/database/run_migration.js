const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
    let connection;
    
    try {
        // Créer la connexion à la base de données
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'recruitment_platform',
            multipleStatements: true
        });

        console.log('✅ Connected to database');

        // Lire le fichier de migration
        const migrationPath = path.join(__dirname, 'migrate_application_fields.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        console.log('📄 Running migration...');

        // Exécuter la migration
        const [results] = await connection.query(migrationSQL);

        console.log('✅ Migration completed successfully!');
        console.log('Results:', results);

        // Vérifier que les colonnes existent maintenant
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'applications'
            AND COLUMN_NAME IN ('phone', 'address', 'portfolio_url', 'cover_letter')
        `, [process.env.DB_NAME || 'recruitment_platform']);

        console.log('\n📋 Columns found in applications table:');
        columns.forEach(col => {
            console.log(`  - ${col.COLUMN_NAME}`);
        });

        if (columns.length === 4) {
            console.log('\n✅ All required columns exist!');
        } else {
            console.log(`\n⚠️  Expected 4 columns, found ${columns.length}`);
        }

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed');
        }
    }
}

runMigration();

