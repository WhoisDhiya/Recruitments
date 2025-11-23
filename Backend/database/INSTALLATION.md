# 📦 Installation de la Base de Données

Ce guide vous explique comment installer et configurer la base de données MySQL pour la plateforme de recrutement.

## 📋 Prérequis

- MySQL Server installé (version 5.7 ou supérieure)
- Accès à la ligne de commande MySQL ou à un client graphique (phpMyAdmin, MySQL Workbench, etc.)

## 🚀 Installation

### Méthode 1 : Via la ligne de commande MySQL

1. **Ouvrez votre terminal/invite de commandes**

2. **Connectez-vous à MySQL** :
   ```bash
   mysql -u root -p
   ```
   Entrez votre mot de passe MySQL lorsque demandé.

3. **Exécutez le script SQL** :
   ```sql
   source C:/ProjetBackend/database/schema.sql
   ```
   
   Ou depuis le dossier du projet :
   ```sql
   source database/schema.sql
   ```

4. **Vérifiez l'installation** :
   ```sql
   USE recruitment_platform;
   SHOW TABLES;
   ```
   
   Vous devriez voir 8 tables :
   - users
   - recruiters
   - candidates
   - admins
   - offers
   - requirements
   - applications
   - notifications
   - payments

### Méthode 2 : Import direct depuis Windows

```bash
mysql -u root -p < database/schema.sql
```

### Méthode 3 : Via phpMyAdmin

1. Ouvrez phpMyAdmin dans votre navigateur
2. Cliquez sur "Importer" dans le menu principal
3. Sélectionnez le fichier `database/schema.sql`
4. Cliquez sur "Exécuter"

### Méthode 4 : Via MySQL Workbench

1. Ouvrez MySQL Workbench
2. Connectez-vous à votre serveur MySQL
3. Menu : Server → Data Import
4. Sélectionnez "Import from Self-Contained File"
5. Choisissez le fichier `database/schema.sql`
6. Cliquez sur "Start Import"

## ⚙️ Configuration

### 1. Créer votre utilisateur MySQL (optionnel)

Si vous voulez utiliser un utilisateur spécifique au lieu de root :

```sql
-- Se connecter à MySQL en tant que root
mysql -u root -p

-- Créer un nouvel utilisateur
CREATE USER 'recruitment_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe_secure';

-- Donner tous les privilèges sur la base de données
GRANT ALL PRIVILEGES ON recruitment_platform.* TO 'recruitment_user'@'localhost';

-- Appliquer les changements
FLUSH PRIVILEGES;
```

### 2. Configurer le fichier .env

Mettez à jour votre fichier `.env` avec vos informations de connexion :

```env
DB_HOST=localhost
DB_USER=root
# OU DB_USER=recruitment_user (si vous avez créé un utilisateur)
DB_PASSWORD=votre_mot_de_passe
DB_NAME=recruitment_platform
```

## ✅ Vérification

### Tester la connexion avec Node.js

1. **Démarrez le serveur** :
   ```bash
   npm run dev
   ```

2. **Testez l'endpoint de santé** :
   Ouvrez votre navigateur : `http://localhost:3000/api/health`
   
   Vous devriez voir :
   ```json
   {
     "status": "OK",
     "message": "La base de données est connectée",
     "database": "recruitment_platform"
   }
   ```

### Vérifier les données de test

Le script crée automatiquement un compte administrateur :

```sql
-- Afficher l'admin créé
SELECT * FROM users WHERE role = 'admin';
SELECT * FROM admins;
```

## 📊 Structure de la Base de Données

### Tables créées :

1. **users** - Utilisateurs (table parent)
   - Rôles : recruiter, candidate, admin
   
2. **recruiters** - Profils des recruteurs
   - Informations de l'entreprise
   
3. **candidates** - Profils des candidats
   - CV, compétences, expérience
   
4. **admins** - Profils des administrateurs
   - Permissions spéciales
   
5. **offers** - Offres d'emploi
   - Titre, description, type de contrat
   
6. **requirements** - Exigences des offres
   - Compétences requises, diplômes, etc.
   
7. **applications** - Candidatures
   - Lien entre candidats et offres
   
8. **notifications** - Notifications système
   - Alertes pour les utilisateurs
   
9. **payments** - Paiements
   - Gestion des paiements des recruteurs

## 🔧 Dépannage

### Erreur : "Access denied for user"

- Vérifiez votre nom d'utilisateur et mot de passe MySQL
- Assurez-vous que l'utilisateur a les permissions nécessaires

### Erreur : "Database already exists"

Si la base de données existe déjà, supprimez-la d'abord :

```sql
DROP DATABASE recruitment_platform;
```

Puis réexécutez le script `schema.sql`.

### Erreur de connexion depuis Node.js

1. Vérifiez que MySQL est démarré
2. Vérifiez les informations dans le fichier `.env`
3. Testez la connexion manuellement :
   ```bash
   mysql -u root -p -h localhost recruitment_platform
   ```

## 📝 Maintenance

### Sauvegarder la base de données

```bash
mysqldump -u root -p recruitment_platform > backup.sql
```

### Restaurer depuis une sauvegarde

```bash
mysql -u root -p recruitment_platform < backup.sql
```

### Réinitialiser la base de données

```bash
mysql -u root -p recruitment_platform < database/schema.sql
```

## 🎯 Prochaines étapes

Une fois la base de données installée :

1. ✅ Testez la connexion avec `npm run dev`
2. ✅ Vérifiez l'endpoint `/api/health`
3. ✅ Commencez à créer vos routes et controllers
4. ✅ Implémentez l'authentification JWT
5. ✅ Créez vos endpoints API

## 📞 Support

Si vous rencontrez des problèmes, vérifiez :
- Les logs MySQL : `/var/log/mysql/error.log` (Linux) ou Event Viewer (Windows)
- Les logs de l'application Node.js
- La configuration du fichier `.env`


