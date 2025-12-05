// Script pour créer un administrateur dans la base de données
// Utilisation: node scripts/create-admin.js

const bcrypt = require('bcrypt');
const db = require('../config/database');
const Admin = require('../models/Admin');

async function createAdmin() {
    try {
        console.log('🚀 Démarrage de la création de l\'administrateur...\n');

        // Configuration de l'admin
        const email = 'admin@recruitment.com';
        const password = 'admin123';
        const firstName = 'Admin';
        const lastName = 'User';

        // Vérifier si l'admin existe déjà
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            console.log('⚠️  Un utilisateur avec cet email existe déjà!');
            console.log('Voulez-vous le supprimer et en créer un nouveau? (y/n)');
            
            // Pour automatiser, on supprime l'ancien
            const userId = existing[0].id;
            
            // Supprimer l'entrée admin si elle existe
            await db.query('DELETE FROM admins WHERE user_id = ?', [userId]);
            // Supprimer l'utilisateur
            await db.query('DELETE FROM users WHERE id = ?', [userId]);
            console.log('✅ Ancien utilisateur supprimé\n');
        }

        // Hasher le mot de passe
        console.log('🔐 Hachage du mot de passe...');
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('✅ Mot de passe hashé avec succès\n');

        // Créer l'utilisateur
        console.log('👤 Création de l\'utilisateur...');
        const [result] = await db.query(
            'INSERT INTO users (last_name, first_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [lastName, firstName, email, hashedPassword, 'admin']
        );
        const userId = result.insertId;
        console.log(`✅ Utilisateur créé avec ID: ${userId}\n`);

        // Créer l'entrée admin
        console.log('🔑 Création de l\'entrée admin...');
        const adminId = await Admin.create(userId);
        console.log(`✅ Admin créé avec ID: ${adminId}\n`);

        // Vérification finale
        const [verification] = await db.query(`
            SELECT 
                u.id as user_id,
                u.first_name,
                u.last_name,
                u.email,
                u.role,
                a.id as admin_id
            FROM users u
            JOIN admins a ON u.id = a.user_id
            WHERE u.email = ?
        `, [email]);

        if (verification.length > 0) {
            console.log('========================================');
            console.log('✅ ADMIN CRÉÉ AVEC SUCCÈS!');
            console.log('========================================');
            console.log('📧 Email:', email);
            console.log('🔑 Mot de passe: admin123');
            console.log('👤 Nom:', `${firstName} ${lastName}`);
            console.log('🆔 User ID:', verification[0].user_id);
            console.log('🆔 Admin ID:', verification[0].admin_id);
            console.log('========================================\n');
            console.log('Vous pouvez maintenant vous connecter avec ces identifiants!');
        } else {
            console.log('❌ Erreur lors de la vérification');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de la création de l\'admin:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Exécuter le script
createAdmin();

