# 📡 Endpoints Backend à Implémenter

## 🎯 **Vue d'Ensemble**

Le frontend est **prêt** et **attend** ces endpoints. Voici ce qui doit être implémenté dans le backend pour que le Dashboard fonctionne.

---

## ✅ **Endpoints Déjà Implémentés**

1. ✅ `POST /api/auth/signup` - Inscription
2. ✅ `GET /api/health` - Vérification de la santé
3. ✅ `POST /api/auth/login` - Connexion (dans loginController.js)

---

## 🔴 **Endpoints à Implémenter**

### **1. Statistiques du Dashboard**

#### `GET /api/dashboard/stats`
**Rôle requis :** Candidate (JWT)

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "appliedJobs": 12,
    "favoriteJobs": 5,
    "jobAlerts": 3
  }
}
```

**Code à ajouter :**
```javascript
// Backend/controllers/dashboardController.js
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id; // Depuis le middleware auth
    const candidateId = await Candidate.findByUserId(userId);

    const appliedJobs = await Application.countByCandidate(candidateId);
    const favoriteJobs = 0; // À implémenter plus tard
    const jobAlerts = await Notification.countUnreadByUser(userId);

    res.json({
      success: true,
      data: {
        appliedJobs,
        favoriteJobs,
        jobAlerts
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors du chargement des statistiques' 
    });
  }
};
```

---

### **2. Gestion des Candidatures**

#### `GET /api/applications/candidate/:candidateId`
**Rôle requis :** Candidate (JWT)

**Réponse attendue :**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "candidate_id": 5,
      "offer_id": 12,
      "status": "pending",
      "date_application": "2024-01-15T10:30:00Z",
      "offer": {
        "id": 12,
        "title": "Développeur Full Stack",
        "date_offer": "2024-01-10",
        "date_expiration": "2024-02-10",
        "recruiter": {
          "company_name": "TechCorp"
        }
      }
    }
  ]
}
```

---

#### `POST /api/applications`
**Rôle requis :** Candidate (JWT)

**Body :**
```json
{
  "offer_id": 12
}
```

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "id": 25,
    "message": "Candidature envoyée avec succès"
  }
}
```

---

#### `PUT /api/applications/:id/status`
**Rôle requis :** Recruiter (JWT)

**Body :**
```json
{
  "status": "accepted"
}
```

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "message": "Statut mis à jour"
  }
}
```

---

### **3. Gestion des Notifications**

#### `GET /api/notifications`
**Rôle requis :** Candidate/Recruiter (JWT)

**Réponse attendue :**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 5,
      "application_id": 12,
      "email": "user@example.com",
      "subject": "Nouvelle candidature",
      "message": "Vous avez une nouvelle candidature pour...",
      "status": "unread",
      "sent_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

#### `PUT /api/notifications/:id/read`
**Rôle requis :** Candidate/Recruiter (JWT)

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "message": "Notification marquée comme lue"
  }
}
```

---

### **4. Gestion des Offres (déjà partiellement là)**

#### `GET /api/offers`
**Rôle :** Public

**Réponse attendue :**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "recruiter_id": 3,
      "title": "Développeur Full Stack",
      "date_offer": "2024-01-10",
      "date_expiration": "2024-02-10"
    }
  ]
}
```

---

#### `GET /api/offers/:id`
**Rôle :** Public

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "recruiter_id": 3,
    "title": "Développeur Full Stack",
    "date_offer": "2024-01-10",
    "date_expiration": "2024-02-10",
    "requirements": [
      {
        "id": 1,
        "offer_id": 1,
        "description": "3 ans d'expérience en React"
      }
    ],
    "recruiter": {
      "id": 3,
      "user_id": 8,
      "company_name": "TechCorp",
      "industry": "IT",
      "description": "..."
    }
  }
}
```

---

#### `POST /api/offers`
**Rôle requis :** Recruiter (JWT)

**Body :**
```json
{
  "title": "Développeur Full Stack",
  "date_expiration": "2024-02-10",
  "requirements": [
    {
      "description": "3 ans d'expérience en React"
    }
  ]
}
```

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "message": "Offre créée avec succès"
  }
}
```

---

## 🛠️ **Méthodes à Ajouter aux Modèles**

### **Application.js**
```javascript
// Compter les candidatures d'un candidat
static async countByCandidate(candidateId) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as count FROM applications WHERE candidate_id = ?',
    [candidateId]
  );
  return rows[0].count;
}

// Obtenir les candidatures d'un candidat avec les offres
static async findByCandidateWithOffer(candidateId) {
  const [rows] = await pool.query(`
    SELECT a.*, 
           o.title, o.date_offer, o.date_expiration,
           r.company_name
    FROM applications a
    LEFT JOIN offers o ON a.offer_id = o.id
    LEFT JOIN recruiters r ON o.recruiter_id = r.id
    WHERE a.candidate_id = ?
    ORDER BY a.date_application DESC
  `, [candidateId]);
  return rows;
}
```

### **Notification.js**
```javascript
// Compter les notifications non lues
static async countUnreadByUser(userId) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND status = "unread"',
    [userId]
  );
  return rows[0].count;
}

// Marquer comme lu
static async markAsRead(id) {
  await pool.query(
    'UPDATE notifications SET status = "read" WHERE id = ?',
    [id]
  );
}
```

### **Candidate.js**
```javascript
// Trouver un candidat par user_id
static async findByUserId(userId) {
  const [rows] = await pool.query(
    'SELECT * FROM candidates WHERE user_id = ?',
    [userId]
  );
  return rows[0]?.id;
}
```

---

## 🔐 **Middleware d'Authentification**

Assurez-vous que `Backend/middleware/auth.js` extrait correctement l'utilisateur du JWT :

```javascript
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token manquant' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Token invalide' 
    });
  }
};
```

---

## 🚀 **Routes à Ajouter**

### **Backend/routes/dashboardRoutes.js**
```javascript
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.get('/stats', auth, dashboardController.getStats);

module.exports = router;
```

### **Backend/routes/applicationRoutes.js**
```javascript
const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const auth = require('../middleware/auth');

router.get('/candidate/:candidateId', auth, applicationController.getByCandidate);
router.post('/', auth, applicationController.create);
router.put('/:id/status', auth, applicationController.updateStatus);

module.exports = router;
```

### **Backend/routes/notificationRoutes.js**
```javascript
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

router.get('/', auth, notificationController.getAll);
router.put('/:id/read', auth, notificationController.markAsRead);

module.exports = router;
```

### **Backend/index.js (ajouter les routes)**
```javascript
const dashboardRoutes = require('./routes/dashboardRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
```

---

## ✅ **Checklist d'Implémentation**

### **Étape 1 : Modèles**
- [ ] Ajouter `countByCandidate` à Application.js
- [ ] Ajouter `findByCandidateWithOffer` à Application.js
- [ ] Ajouter `countUnreadByUser` à Notification.js
- [ ] Ajouter `markAsRead` à Notification.js
- [ ] Ajouter `findByUserId` à Candidate.js

### **Étape 2 : Controllers**
- [ ] Créer `dashboardController.js`
- [ ] Créer `applicationController.js`
- [ ] Créer `notificationController.js`
- [ ] Modifier `loginController.js` pour retourner un token JWT

### **Étape 3 : Routes**
- [ ] Créer `dashboardRoutes.js`
- [ ] Créer `applicationRoutes.js`
- [ ] Créer `notificationRoutes.js`
- [ ] Ajouter les routes dans `index.js`

### **Étape 4 : Middleware**
- [ ] Vérifier que `auth.js` fonctionne avec JWT
- [ ] Tester l'extraction du `req.user`

### **Étape 5 : JWT**
- [ ] Modifier `loginController.js` pour générer un JWT
- [ ] S'assurer que le JWT contient `{ id, email, role }`

---

## 🧪 **Tests à Effectuer**

### **Test 1 : Connexion**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### **Test 2 : Dashboard Stats**
```bash
curl -X GET http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### **Test 3 : Candidatures**
```bash
curl -X GET http://localhost:3000/api/applications/candidate/5 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📝 **Notes Importantes**

1. **Format des réponses :** Toujours utiliser `{ success: true/false, data: {...} }`
2. **Authentification :** Toujours vérifier le JWT sauf pour les routes publiques
3. **Erreurs :** Toujours renvoyer un message clair
4. **CORS :** Déjà configuré dans `index.js`
5. **Date formats :** Utiliser ISO 8601 (ex: `2024-01-15T10:30:00Z`)

---

## 🎯 **Priorités**

### **Haute Priorité (pour que le Dashboard fonctionne)**
1. ✅ `/api/auth/login` avec JWT
2. ✅ `/api/dashboard/stats`
3. ✅ `/api/applications/candidate/:id`

### **Moyenne Priorité**
4. `/api/applications` (POST)
5. `/api/notifications`

### **Basse Priorité**
6. `/api/offers/:id` (détails)
7. `/api/applications/:id/status` (PUT)

---

## 🚀 **Commencez par Ceci**

1. Modifiez `loginController.js` pour retourner un JWT
2. Créez `dashboardController.js` avec `getStats`
3. Ajoutez les méthodes aux modèles Application et Candidate
4. Créez `dashboardRoutes.js`
5. Testez !

**Le frontend est prêt et attend ces endpoints !** 🎉

