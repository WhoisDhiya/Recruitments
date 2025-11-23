# Plateforme de Recrutement - Backend

Backend pour une plateforme de recrutement permettant la gestion des offres d'emploi, des candidatures et des processus de recrutement.

## 📋 Fonctionnalités

- 👥 **Gestion des utilisateurs** : Recruteurs, Candidats, Administrateurs
- 💼 **Gestion des offres** : Création, modification, recherche d'offres d'emploi
- 📝 **Candidatures** : Soumission et suivi des candidatures
- 🔔 **Notifications** : Système de notifications pour les utilisateurs
- 💳 **Paiements** : Gestion des paiements pour les offres premium
- 📊 **Exigences** : Définition des prérequis pour chaque offre

## 🛠️ Technologies

- **Node.js** avec **Express.js**
- **MySQL** pour la base de données
- **JWT** pour l'authentification
- **Bcrypt** pour le hashage des mots de passe
- **Multer** pour la gestion des fichiers (CV)

## 📦 Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configuration de la base de données

#### Option A : Via MySQL CLI (Recommandé)

1. Ouvrez votre terminal MySQL :
```bash
mysql -u root -p
```

2. Exécutez le script SQL :
```sql
source database/schema.sql
```

Ou directement depuis le terminal :
```bash
mysql -u root -p < database/schema.sql
```

#### Option B : Via un client MySQL (phpMyAdmin, MySQL Workbench, etc.)

1. Ouvrez votre client MySQL
2. Importez le fichier `database/schema.sql`

### 3. Configuration de l'environnement

Créez un fichier `.env` à la racine du projet (un fichier `.env` de base a déjà été créé) :

```env
# Configuration de la base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=recruitment_platform

# Configuration du serveur
PORT=3000
NODE_ENV=development

# JWT Secret (à changer en production)
JWT_SECRET=votre_secret_key_super_secure
```

## 🚀 Démarrage

### Mode développement (avec auto-reload)
```bash
npm run dev
```

### Mode production
```bash
npm start
```

Le serveur démarrera sur `http://localhost:3000`

## 📊 Structure de la base de données

### Tables principales :

- **users** : Utilisateurs (table parent)
- **recruiters** : Profils recruteurs
- **candidates** : Profils candidats
- **admins** : Profils administrateurs
- **offers** : Offres d'emploi
- **requirements** : Exigences des offres
- **applications** : Candidatures
- **notifications** : Notifications
- **payments** : Paiements

### Diagramme des relations :

```
User (1) ----< (1) Recruiter (1) ----< (N) Offer (1) ----< (N) Requirements
  |                                        |
  |                                        |
  |                                    (1) | (N)
  |                                        |
  +--< (1) Candidate (1) ----< (N) Application
  |                                        |
  |                                        |
  +--< (1) Admin                       (N) | (1)
  |                                        |
  +----< (N) Notification <---------------+

Recruiter (1) ----< (N) Payment
```

## 📁 Structure du projet

```
ProjetBackend/
├── config/
│   └── database.js          # Configuration MySQL
├── models/
│   ├── User.js              # Modèle Utilisateur
│   ├── Recruiter.js         # Modèle Recruteur
│   ├── Candidate.js         # Modèle Candidat
│   ├── Offer.js             # Modèle Offre
│   ├── Application.js       # Modèle Candidature
│   ├── Requirement.js       # Modèle Exigence
│   ├── Notification.js      # Modèle Notification
│   ├── Payment.js           # Modèle Paiement
│   └── index.js             # Export de tous les modèles
├── database/
│   └── schema.sql           # Script de création de la BD
├── .env                     # Variables d'environnement
├── package.json
└── README.md
```

## 🔐 Authentification

Le système utilise JWT pour l'authentification. Un compte administrateur par défaut est créé :

- **Email** : `admin@recruitment.com`
- **Mot de passe** : (hashé avec bcrypt dans la base de données)

## 📝 Utilisation des modèles

### Exemple : Créer un utilisateur

```javascript
const { User, Candidate } = require('./models');

// Créer un utilisateur
const userId = await User.create({
    last_name: 'Dupont',
    first_name: 'Jean',
    email: 'jean.dupont@email.com',
    password: hashedPassword,
    role: 'candidate'
});

// Créer le profil candidat
await Candidate.create({
    user_id: userId,
    phone: '0123456789',
    skills: 'JavaScript, Node.js, React'
});
```

### Exemple : Rechercher des offres

```javascript
const { Offer } = require('./models');

// Rechercher des offres
const offers = await Offer.search({
    keyword: 'développeur',
    contract_type: 'cdi',
    location: 'Paris'
});
```

## 🎯 Prochaines étapes

Pour créer une API complète, vous devrez créer :

1. **Routes** (`routes/`) : Définir les endpoints de l'API
2. **Controllers** (`controllers/`) : Logique métier
3. **Middlewares** (`middlewares/`) : Authentification, validation
4. **Services** (`services/`) : Services métier (email, upload, etc.)

## 📄 Licence

ISC

## 👥 Auteur

Votre nom


