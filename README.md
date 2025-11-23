# 🚀 Jobs Platform - Plateforme de Recrutement

Plateforme complète de recrutement avec backend Node.js et frontend (à venir).

## 📁 Structure du Projet

```
JobsPlatform/
├── Backend/          # API Node.js + Express + MySQL
├── Frontend/         # Application Frontend (React/Vue/Angular)
└── README.md         # Ce fichier
```

---

## 🔧 Backend (API)

### Technologies
- **Node.js** + **Express**
- **MySQL** (Base de données)
- **JWT** (Authentification)
- **Bcrypt** (Hachage des mots de passe)

### Installation Backend

```bash
cd Backend
npm install
```

### Configuration

Créez un fichier `.env` dans le dossier `Backend/` :

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=recruitment_platform
DB_PORT=3306

PORT=3000
NODE_ENV=development

JWT_SECRET=ma_cle_secrete_ultra_securisee_2024
```

### Base de Données

```bash
# Créer la base de données
mysql -u root -p < Backend/database/schema.sql
```

### Démarrer le Backend

```bash
cd Backend
node index.js
```

Le serveur démarre sur **http://localhost:3000**

### API Endpoints

#### Authentification
- `POST /api/auth/signup` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion

#### Candidats
- `GET /api/candidates` - Liste des candidats
- `POST /api/candidates` - Créer un candidat
- `GET /api/candidates/:id` - Détails d'un candidat
- `PUT /api/candidates/:id` - Modifier un candidat
- `DELETE /api/candidates/:id` - Supprimer un candidat

---

## 🎨 Frontend

**📌 En attente du code frontend de votre collègue**

Une fois reçu, placez-le dans le dossier `Frontend/`

---

## 👥 Rôles Utilisateurs

- **Candidate** (Candidat)
- **Recruiter** (Recruteur)
- **Admin** (Administrateur)

---

## 📝 Documentation

- Voir `Backend/API_ROADMAP.md` pour la roadmap de l'API
- Voir `Backend/POSTMAN_TESTING.md` pour les tests Postman

---

## 🤝 Contributeurs

- Backend: Votre équipe
- Frontend: En cours de développement

---

## 📄 Licence

Projet privé - Tous droits réservés

