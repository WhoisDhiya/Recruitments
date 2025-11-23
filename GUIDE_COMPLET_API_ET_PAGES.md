# 📋 GUIDE COMPLET - API & PAGES FRONTEND
## JobsPlatform - Répartition Complète des Tâches

**Document de référence pour répartir le travail entre les membres de l'équipe**

---

## 📊 RÉSUMÉ EXÉCUTIF

### **Nombre Total de Tâches:**
- **Backend:** 48 endpoints API à créer
- **Frontend:** 25 pages/composants à créer
- **Total:** 73 tâches

### **Répartition Suggérée:**
- **2 Développeurs Backend:** 24 endpoints chacun
- **2 Développeurs Frontend:** 12-13 pages chacun

### **Durée Estimée:** 4 semaines

---

# 🔧 PARTIE 1: BACKEND - TOUS LES ENDPOINTS API

## 📊 STATISTIQUES ENDPOINTS

| Catégorie | Nombre | Priorité |
|-----------|--------|----------|
| Authentification | 5 endpoints | ⭐⭐⭐ Critique |
| Dashboard Stats | 1 endpoint | ⭐⭐⭐ Critique |
| Candidats | 5 endpoints | ⭐⭐⭐ Critique |
| Offres | 7 endpoints | ⭐⭐⭐ Critique |
| Applications | 4 endpoints | ⭐⭐⭐ Critique |
| Recruteurs | 5 endpoints | ⭐⭐ Important |
| Exigences | 3 endpoints | ⭐⭐ Important |
| Notifications | 3 endpoints | ⭐⭐ Important |
| Favoris | 3 endpoints | ⭐⭐ Important |
| Alertes Emploi | 4 endpoints | ⭐ Moyenne |
| Uploads Fichiers | 4 endpoints | ⭐⭐ Important |
| Analytics | 2 endpoints | ⭐ Moyenne |
| Paiements | 3 endpoints | ⭐ Basse |
| Admin | 4 endpoints | ⭐ Moyenne |
| **TOTAL** | **48 endpoints** | |

---

## 🔐 1. AUTHENTIFICATION (5 endpoints)

**Priorité:** ⭐⭐⭐ CRITIQUE  
**Temps estimé:** 6 heures  
**Assigné à:** Développeur Backend 1

### Endpoints:

#### 1.1 POST /api/auth/signup
```javascript
// Fichier: Backend/controllers/authController.js (EXISTE)
// Statut: ✅ DÉJÀ FAIT
// Description: Inscription nouvel utilisateur
// Body: { last_name, first_name, email, password, role }
// Retour: { success: true, data: { user_id, email, role } }
```

#### 1.2 POST /api/auth/login
```javascript
// Fichier: Backend/controllers/authController.js (EXISTE)
// Statut: ✅ DÉJÀ FAIT
// Description: Connexion utilisateur
// Body: { email, password }
// Retour: { success: true, data: { user, token } }
```

#### 1.3 POST /api/auth/logout
```javascript
// Fichier: Backend/controllers/authController.js
// Statut: ✅ DÉJÀ FAIT
// Description: Déconnexion utilisateur
// Auth: JWT requis
// Retour: { success: true, message: "Déconnexion réussie" }
```

#### 1.4 GET /api/auth/profile
```javascript
// Fichier: Backend/controllers/authController.js
// Statut: ❌ À CRÉER
// Description: Obtenir profil utilisateur connecté
// Auth: JWT requis
// Retour: { success: true, data: { user } }
```

#### 1.5 PUT /api/auth/password
```javascript
// Fichier: Backend/controllers/authController.js
// Statut: ❌ À CRÉER
// Description: Changer mot de passe
// Auth: JWT requis
// Body: { oldPassword, newPassword }
// Retour: { success: true, message: "Mot de passe modifié" }
```

---

## 📊 2. DASHBOARD STATS (1 endpoint)

**Priorité:** ⭐⭐⭐ CRITIQUE  
**Temps estimé:** 3 heures  
**Assigné à:** Développeur Backend 1

#### 2.1 GET /api/dashboard/stats
```javascript
// Fichier: Backend/controllers/dashboardController.js
// Statut: ❌ À CRÉER
// Description: Statistiques dashboard candidat
// Auth: JWT requis (candidate)
// Retour: { 
//   success: true, 
//   data: { 
//     appliedJobs: 12, 
//     favoriteJobs: 5, 
//     jobAlerts: 3 
//   } 
// }
```

---

## 👤 3. CANDIDATS (5 endpoints)

**Priorité:** ⭐⭐⭐ CRITIQUE  
**Temps estimé:** 5 heures  
**Assigné à:** Développeur Backend 1

### Endpoints:

#### 3.1 GET /api/candidates
```javascript
// Fichier: Backend/controllers/candidateController.js
// Statut: ✅ DÉJÀ FAIT
// Description: Liste tous les candidats
// Auth: JWT requis (admin/recruiter)
// Retour: { success: true, data: [candidats] }
```

#### 3.2 GET /api/candidates/profile/:candidateId
```javascript
// Fichier: Backend/controllers/candidateController.js
// Statut: ✅ DÉJÀ FAIT
// Description: Profil candidat par candidateId
// Auth: JWT requis
// Retour: { success: true, data: { candidate } }
```

#### 3.3 GET /api/candidates/profile/user/:userId
```javascript
// Fichier: Backend/controllers/candidateController.js
// Statut: ✅ DÉJÀ FAIT
// Description: Profil candidat par userId
// Auth: JWT requis
// Retour: { success: true, data: { candidate } }
```

#### 3.4 PUT /api/candidates/profile/:candidateId
```javascript
// Fichier: Backend/controllers/candidateController.js
// Statut: ✅ DÉJÀ FAIT
// Description: Modifier profil candidat
// Auth: JWT requis
// Body: { cv, image, ... }
// Retour: { success: true, message: "Profil mis à jour" }
```

#### 3.5 GET /api/candidates/:candidateId/applications
```javascript
// Fichier: Backend/controllers/candidateController.js
// Statut: ✅ DÉJÀ FAIT
// Description: Candidatures d'un candidat
// Auth: JWT requis
// Retour: { success: true, data: [applications] }
```

---

## 💼 4. OFFRES D'EMPLOI (7 endpoints)

**Priorité:** ⭐⭐⭐ CRITIQUE  
**Temps estimé:** 8 heures  
**Assigné à:** Développeur Backend 1

### Endpoints:

#### 4.1 GET /api/offers
```javascript
// Fichier: Backend/controllers/offerController.js
// Statut: ❌ À CRÉER
// Description: Liste toutes les offres
// Auth: Public
// Query: ?page=1&limit=10
// Retour: { success: true, data: [offers], total: 50 }
```

#### 4.2 GET /api/offers/:id
```javascript
// Fichier: Backend/controllers/offerController.js
// Statut: ❌ À CRÉER
// Description: Détails d'une offre
// Auth: Public
// Retour: { success: true, data: { offer, requirements, recruiter } }
```

#### 4.3 POST /api/offers
```javascript
// Fichier: Backend/controllers/offerController.js
// Statut: ❌ À CRÉER
// Description: Créer offre
// Auth: JWT requis (recruiter)
// Body: { title, date_expiration, requirements: [...] }
// Retour: { success: true, data: { id, message } }
```

#### 4.4 PUT /api/offers/:id
```javascript
// Fichier: Backend/controllers/offerController.js
// Statut: ❌ À CRÉER
// Description: Modifier offre
// Auth: JWT requis (recruiter propriétaire)
// Body: { title, date_expiration }
// Retour: { success: true, message: "Offre modifiée" }
```

#### 4.5 DELETE /api/offers/:id
```javascript
// Fichier: Backend/controllers/offerController.js
// Statut: ❌ À CRÉER
// Description: Supprimer offre
// Auth: JWT requis (recruiter propriétaire)
// Retour: { success: true, message: "Offre supprimée" }
```

#### 4.6 GET /api/offers/:id/applications
```javascript
// Fichier: Backend/controllers/offerController.js
// Statut: ❌ À CRÉER
// Description: Candidatures d'une offre
// Auth: JWT requis (recruiter propriétaire)
// Retour: { success: true, data: [applications] }
```

#### 4.7 GET /api/offers/search
```javascript
// Fichier: Backend/controllers/offerController.js
// Statut: ❌ À CRÉER
// Description: Recherche avancée offres
// Auth: Public
// Query: ?keyword=dev&location=tunis&type=fulltime&salary_min=1000
// Retour: { success: true, data: [offers] }
```

---

## 📝 5. CANDIDATURES (4 endpoints)

**Priorité:** ⭐⭐⭐ CRITIQUE  
**Temps estimé:** 5 heures  
**Assigné à:** Développeur Backend 1

### Endpoints:

#### 5.1 POST /api/applications
```javascript
// Fichier: Backend/controllers/applicationController.js
// Statut: ❌ À CRÉER
// Description: Postuler à une offre
// Auth: JWT requis (candidate)
// Body: { offer_id }
// Retour: { success: true, data: { id, message } }
```

#### 5.2 GET /api/applications/:id
```javascript
// Fichier: Backend/controllers/applicationController.js
// Statut: ❌ À CRÉER
// Description: Détails candidature
// Auth: JWT requis
// Retour: { success: true, data: { application, offer, candidate } }
```

#### 5.3 PUT /api/applications/:id/status
```javascript
// Fichier: Backend/controllers/applicationController.js
// Statut: ❌ À CRÉER
// Description: Changer statut candidature
// Auth: JWT requis (recruiter)
// Body: { status: 'accepted' }
// Retour: { success: true, message: "Statut mis à jour" }
```

#### 5.4 DELETE /api/applications/:id
```javascript
// Fichier: Backend/controllers/applicationController.js
// Statut: ❌ À CRÉER
// Description: Annuler candidature
// Auth: JWT requis (candidate propriétaire)
// Retour: { success: true, message: "Candidature annulée" }
```

---

## 👔 6. RECRUTEURS (5 endpoints)

**Priorité:** ⭐⭐ IMPORTANT  
**Temps estimé:** 5 heures  
**Assigné à:** Développeur Backend 2

### Endpoints:

#### 6.1 GET /api/recruiters
```javascript
// Fichier: Backend/controllers/recruiterController.js
// Statut: ❌ À CRÉER
// Description: Liste recruteurs
// Auth: Public
// Retour: { success: true, data: [recruiters] }
```

#### 6.2 GET /api/recruiters/:id
```javascript
// Fichier: Backend/controllers/recruiterController.js
// Statut: ❌ À CRÉER
// Description: Détails recruteur
// Auth: Public
// Retour: { success: true, data: { recruiter, user } }
```

#### 6.3 GET /api/recruiters/user/:userId
```javascript
// Fichier: Backend/controllers/recruiterController.js
// Statut: ❌ À CRÉER
// Description: Profil recruteur par userId
// Auth: JWT requis
// Retour: { success: true, data: { recruiter } }
```

#### 6.4 PUT /api/recruiters/:id
```javascript
// Fichier: Backend/controllers/recruiterController.js
// Statut: ❌ À CRÉER
// Description: Modifier profil recruteur
// Auth: JWT requis (recruiter propriétaire)
// Body: { company_name, industry, description, company_email, company_address }
// Retour: { success: true, message: "Profil modifié" }
```

#### 6.5 GET /api/recruiters/:id/offers
```javascript
// Fichier: Backend/controllers/recruiterController.js
// Statut: ❌ À CRÉER
// Description: Offres d'un recruteur
// Auth: Public
// Retour: { success: true, data: [offers] }
```

---

## 📋 7. EXIGENCES (3 endpoints)

**Priorité:** ⭐⭐ IMPORTANT  
**Temps estimé:** 3 heures  
**Assigné à:** Développeur Backend 1

### Endpoints:

#### 7.1 POST /api/requirements
```javascript
// Fichier: Backend/controllers/requirementController.js
// Statut: ❌ À CRÉER
// Description: Ajouter exigence à offre
// Auth: JWT requis (recruiter)
// Body: { offer_id, description }
// Retour: { success: true, data: { id } }
```

#### 7.2 GET /api/requirements/offer/:offerId
```javascript
// Fichier: Backend/controllers/requirementController.js
// Statut: ❌ À CRÉER
// Description: Exigences d'une offre
// Auth: Public
// Retour: { success: true, data: [requirements] }
```

#### 7.3 DELETE /api/requirements/:id
```javascript
// Fichier: Backend/controllers/requirementController.js
// Statut: ❌ À CRÉER
// Description: Supprimer exigence
// Auth: JWT requis (recruiter propriétaire)
// Retour: { success: true, message: "Exigence supprimée" }
```

---

## 🔔 8. NOTIFICATIONS (3 endpoints)

**Priorité:** ⭐⭐ IMPORTANT  
**Temps estimé:** 4 heures  
**Assigné à:** Développeur Backend 2

### Endpoints:

#### 8.1 GET /api/notifications
```javascript
// Fichier: Backend/controllers/notificationController.js
// Statut: ❌ À CRÉER
// Description: Notifications utilisateur
// Auth: JWT requis
// Retour: { success: true, data: [notifications] }
```

#### 8.2 PUT /api/notifications/:id/read
```javascript
// Fichier: Backend/controllers/notificationController.js
// Statut: ❌ À CRÉER
// Description: Marquer notification comme lue
// Auth: JWT requis
// Retour: { success: true, message: "Marquée comme lue" }
```

#### 8.3 DELETE /api/notifications/:id
```javascript
// Fichier: Backend/controllers/notificationController.js
// Statut: ❌ À CRÉER
// Description: Supprimer notification
// Auth: JWT requis
// Retour: { success: true, message: "Notification supprimée" }
```

---

## ⭐ 9. FAVORIS (3 endpoints)

**Priorité:** ⭐⭐ IMPORTANT  
**Temps estimé:** 4 heures  
**Assigné à:** Développeur Backend 2

**Note:** Nécessite création table `favorites` dans la BDD

### Table SQL à créer:
```sql
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    offer_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_favorite (candidate_id, offer_id),
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

### Endpoints:

#### 9.1 POST /api/favorites
```javascript
// Fichier: Backend/controllers/favoriteController.js
// Statut: ❌ À CRÉER
// Description: Ajouter emploi aux favoris
// Auth: JWT requis (candidate)
// Body: { offer_id }
// Retour: { success: true, data: { id } }
```

#### 9.2 GET /api/favorites/candidate/:id
```javascript
// Fichier: Backend/controllers/favoriteController.js
// Statut: ❌ À CRÉER
// Description: Liste favoris d'un candidat
// Auth: JWT requis
// Retour: { success: true, data: [offers] }
```

#### 9.3 DELETE /api/favorites/:id
```javascript
// Fichier: Backend/controllers/favoriteController.js
// Statut: ❌ À CRÉER
// Description: Retirer des favoris
// Auth: JWT requis (candidate propriétaire)
// Retour: { success: true, message: "Retiré des favoris" }
```

---

## 🔔 10. ALERTES EMPLOI (4 endpoints)

**Priorité:** ⭐ MOYENNE  
**Temps estimé:** 5 heures  
**Assigné à:** Développeur Backend 2

**Note:** Nécessite création table `job_alerts` dans la BDD

### Table SQL à créer:
```sql
CREATE TABLE IF NOT EXISTS job_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    keyword VARCHAR(255),
    location VARCHAR(255),
    job_type VARCHAR(100),
    frequency ENUM('daily', 'weekly', 'instant') DEFAULT 'daily',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

### Endpoints:

#### 10.1 POST /api/job-alerts
```javascript
// Fichier: Backend/controllers/jobAlertController.js
// Statut: ❌ À CRÉER
// Description: Créer alerte emploi
// Auth: JWT requis
// Body: { keyword, location, job_type, frequency }
// Retour: { success: true, data: { id } }
```

#### 10.2 GET /api/job-alerts/user/:userId
```javascript
// Fichier: Backend/controllers/jobAlertController.js
// Statut: ❌ À CRÉER
// Description: Liste alertes utilisateur
// Auth: JWT requis
// Retour: { success: true, data: [alerts] }
```

#### 10.3 PUT /api/job-alerts/:id
```javascript
// Fichier: Backend/controllers/jobAlertController.js
// Statut: ❌ À CRÉER
// Description: Modifier alerte
// Auth: JWT requis (propriétaire)
// Body: { keyword, location, is_active }
// Retour: { success: true, message: "Alerte modifiée" }
```

#### 10.4 DELETE /api/job-alerts/:id
```javascript
// Fichier: Backend/controllers/jobAlertController.js
// Statut: ❌ À CRÉER
// Description: Supprimer alerte
// Auth: JWT requis (propriétaire)
// Retour: { success: true, message: "Alerte supprimée" }
```

---

## 📤 11. UPLOADS FICHIERS (4 endpoints)

**Priorité:** ⭐⭐ IMPORTANT  
**Temps estimé:** 6 heures  
**Assigné à:** Développeur Backend 2

**Note:** Nécessite configuration Multer

### Endpoints:

#### 11.1 POST /api/upload/cv
```javascript
// Fichier: Backend/controllers/uploadController.js
// Statut: ❌ À CRÉER
// Description: Upload CV (PDF uniquement)
// Auth: JWT requis (candidate)
// Form-data: file
// Validation: PDF, max 5MB
// Retour: { success: true, data: { filename, url } }
```

#### 11.2 POST /api/upload/image
```javascript
// Fichier: Backend/controllers/uploadController.js
// Statut: ❌ À CRÉER
// Description: Upload photo profil
// Auth: JWT requis
// Form-data: file
// Validation: JPG/PNG, max 2MB
// Retour: { success: true, data: { filename, url } }
```

#### 11.3 GET /api/uploads/:filename
```javascript
// Fichier: Backend/controllers/uploadController.js
// Statut: ❌ À CRÉER
// Description: Récupérer fichier uploadé
// Auth: Public
// Retour: Fichier
```

#### 11.4 DELETE /api/uploads/:filename
```javascript
// Fichier: Backend/controllers/uploadController.js
// Statut: ❌ À CRÉER
// Description: Supprimer fichier
// Auth: JWT requis (propriétaire)
// Retour: { success: true, message: "Fichier supprimé" }
```

---

## 📊 12. ANALYTICS (2 endpoints)

**Priorité:** ⭐ MOYENNE  
**Temps estimé:** 4 heures  
**Assigné à:** Développeur Backend 2

### Endpoints:

#### 12.1 GET /api/analytics/recruiter/:id
```javascript
// Fichier: Backend/controllers/analyticsController.js
// Statut: ❌ À CRÉER
// Description: Analytics recruteur
// Auth: JWT requis (recruiter propriétaire)
// Retour: { 
//   success: true, 
//   data: { 
//     jobsPosted: 10, 
//     totalApplications: 50, 
//     pendingApplications: 20,
//     acceptedApplications: 15
//   } 
// }
```

#### 12.2 GET /api/analytics/candidate/:id
```javascript
// Fichier: Backend/controllers/analyticsController.js
// Statut: ❌ À CRÉER
// Description: Analytics candidat
// Auth: JWT requis (candidate propriétaire)
// Retour: { 
//   success: true, 
//   data: { 
//     totalApplications: 20, 
//     pending: 10, 
//     accepted: 5, 
//     rejected: 5 
//   } 
// }
```

---

## 💳 13. PAIEMENTS (3 endpoints)

**Priorité:** ⭐ BASSE  
**Temps estimé:** 5 heures  
**Assigné à:** Développeur Backend 2

### Endpoints:

#### 13.1 POST /api/payments
```javascript
// Fichier: Backend/controllers/paymentController.js
// Statut: ❌ À CRÉER
// Description: Créer paiement
// Auth: JWT requis (recruiter)
// Body: { amount, payment_method, offer_id? }
// Retour: { success: true, data: { id, transaction_id } }
```

#### 13.2 GET /api/payments/recruiter/:recruiterId
```javascript
// Fichier: Backend/controllers/paymentController.js
// Statut: ❌ À CRÉER
// Description: Historique paiements recruteur
// Auth: JWT requis (recruiter propriétaire)
// Retour: { success: true, data: [payments] }
```

#### 13.3 GET /api/payments/:id
```javascript
// Fichier: Backend/controllers/paymentController.js
// Statut: ❌ À CRÉER
// Description: Détails paiement
// Auth: JWT requis
// Retour: { success: true, data: { payment } }
```

---

## 👨‍💼 14. ADMIN (4 endpoints)

**Priorité:** ⭐ MOYENNE  
**Temps estimé:** 5 heures  
**Assigné à:** Développeur Backend 2

### Endpoints:

#### 14.1 GET /api/admin/users
```javascript
// Fichier: Backend/controllers/adminController.js
// Statut: ❌ À CRÉER
// Description: Liste tous utilisateurs
// Auth: JWT requis (admin)
// Query: ?role=candidate&page=1&limit=20
// Retour: { success: true, data: [users], total: 100 }
```

#### 14.2 DELETE /api/admin/users/:id
```javascript
// Fichier: Backend/controllers/adminController.js
// Statut: ❌ À CRÉER
// Description: Supprimer utilisateur
// Auth: JWT requis (admin)
// Retour: { success: true, message: "Utilisateur supprimé" }
```

#### 14.3 GET /api/admin/stats
```javascript
// Fichier: Backend/controllers/adminController.js
// Statut: ❌ À CRÉER
// Description: Statistiques plateforme
// Auth: JWT requis (admin)
// Retour: { 
//   success: true, 
//   data: { 
//     totalUsers: 500, 
//     totalJobs: 100, 
//     totalApplications: 1000,
//     activeCandidates: 300,
//     activeRecruiters: 50
//   } 
// }
```

#### 14.4 PUT /api/admin/users/:id/status
```javascript
// Fichier: Backend/controllers/adminController.js
// Statut: ❌ À CRÉER
// Description: Suspendre/activer utilisateur
// Auth: JWT requis (admin)
// Body: { status: 'suspended' }
// Retour: { success: true, message: "Statut mis à jour" }
```

---

# 🎨 PARTIE 2: FRONTEND - TOUTES LES PAGES

## 📊 STATISTIQUES PAGES

| Catégorie | Nombre | Priorité |
|-----------|--------|----------|
| Authentification | 2 pages | ⭐⭐⭐ Critique |
| Dashboard Candidat | 5 pages | ⭐⭐⭐ Critique |
| Dashboard Recruteur | 4 pages | ⭐⭐ Important |
| Jobs & Recherche | 3 pages | ⭐⭐⭐ Critique |
| Admin | 3 pages | ⭐ Moyenne |
| Composants Communs | 8 composants | ⭐⭐ Important |
| **TOTAL** | **25 pages/composants** | |

---

## 🔐 1. AUTHENTIFICATION (2 pages)

**Priorité:** ⭐⭐⭐ CRITIQUE  
**Temps estimé:** 4 heures (déjà fait)  
**Assigné à:** Développeur Frontend 1

### Pages:

#### 1.1 Page Inscription
```typescript
// Fichier: Frontend/src/pages/signup.tsx
// Statut: ✅ DÉJÀ FAIT
// Description: Formulaire inscription
// Fonctionnalités:
// - Champs: nom, prénom, email, password
// - Sélection rôle (candidat/recruteur)
// - Validation formulaire
// - Appel API: POST /api/auth/signup
// - Redirection après succès
```

#### 1.2 Page Connexion
```typescript
// Fichier: Frontend/src/pages/SignIn.tsx
// Statut: ✅ DÉJÀ FAIT
// Description: Formulaire connexion
// Fonctionnalités:
// - Champs: email, password
// - "Se souvenir de moi"
// - Lien "Mot de passe oublié"
// - Appel API: POST /api/auth/login
// - Stockage token JWT
// - Redirection basée sur rôle
```

---

## 📊 2. DASHBOARD CANDIDAT (5 pages)

**Priorité:** ⭐⭐⭐ CRITIQUE  
**Temps estimé:** 20 heures  
**Assigné à:** Développeur Frontend 1

### Pages:

#### 2.1 Dashboard Overview
```typescript
// Fichier: Frontend/src/pages/Dashboard.tsx
// Statut: 🟡 PARTIEL (UI faite, API à connecter)
// Description: Vue d'ensemble candidat
// Fonctionnalités:
// - Cartes stats (candidatures, favoris, alertes)
// - Appel API: GET /api/dashboard/stats
// - Candidatures récentes
// - Navigation tabs
// - Header avec recherche
// - Sélecteur pays
// Temps: 4 heures (connexion API + ajustements)
```

#### 2.2 Candidatures Envoyées
```typescript
// Fichier: Frontend/src/pages/AppliedJobs.tsx
// Statut: 🟡 PARTIEL (UI existe, données à charger)
// Description: Liste candidatures du candidat
// Fonctionnalités:
// - Tableau candidatures
// - Appel API: GET /api/candidates/{id}/applications
// - Filtres par statut
// - Badges de statut (pending, accepted, rejected)
// - Action "Voir détails"
// Temps: 3 heures
```

#### 2.3 Emplois Favoris
```typescript
// Fichier: Frontend/src/pages/FavoriteJobs.tsx
// Statut: ❌ À CRÉER
// Description: Liste emplois favoris
// Fonctionnalités:
// - Grille emplois favoris
// - Appel API: GET /api/favorites/candidate/{id}
// - Bouton "Retirer des favoris"
// - Bouton "Postuler"
// - Filtre par type/localisation
// Temps: 4 heures
```

#### 2.4 Alertes Emploi
```typescript
// Fichier: Frontend/src/pages/JobAlert.tsx
// Statut: ❌ À CRÉER
// Description: Gestion alertes emploi
// Fonctionnalités:
// - Liste alertes actives
// - Appel API: GET /api/job-alerts/user/{userId}
// - Formulaire créer alerte
// - Appel API: POST /api/job-alerts
// - Toggle activer/désactiver
// - Supprimer alerte
// - Fréquence (quotidien, hebdomadaire, instantané)
// Temps: 5 heures
```

#### 2.5 Paramètres Candidat
```typescript
// Fichier: Frontend/src/pages/Settings.tsx
// Statut: ❌ À CRÉER
// Description: Paramètres compte candidat
// Fonctionnalités:
// - Modifier infos profil
// - Appel API: PUT /api/candidates/profile/{id}
// - Upload photo profil
// - Appel API: POST /api/upload/image
// - Upload CV
// - Appel API: POST /api/upload/cv
// - Changer mot de passe
// - Appel API: PUT /api/auth/password
// Temps: 4 heures
```

---

## 💼 3. JOBS & RECHERCHE (3 pages)

**Priorité:** ⭐⭐⭐ CRITIQUE  
**Temps estimé:** 15 heures  
**Assigné à:** Développeur Frontend 1

### Pages:

#### 3.1 Liste des Emplois
```typescript
// Fichier: Frontend/src/pages/JobListings.tsx
// Statut: ❌ À CRÉER
// Description: Navigation emplois
// Fonctionnalités:
// - Grille/Liste emplois
// - Appel API: GET /api/offers
// - Barre recherche
// - Filtres (type, localisation, salaire)
// - Pagination
// - Bouton "Voir détails"
// - Bouton "Ajouter favoris"
// - Toggle vue grille/liste
// Temps: 6 heures
```

#### 3.2 Détails Emploi
```typescript
// Fichier: Frontend/src/pages/JobDetails.tsx
// Statut: ❌ À CRÉER
// Description: Page détails offre
// Fonctionnalités:
// - Appel API: GET /api/offers/{id}
// - Titre & entreprise
// - Description complète
// - Liste exigences
// - Infos (salaire, type, localisation)
// - Date expiration
// - Bouton "Postuler"
// - Appel API: POST /api/applications
// - Bouton "Ajouter favoris"
// - Partage réseau social
// Temps: 5 heures
```

#### 3.3 Recherche Avancée
```typescript
// Fichier: Frontend/src/pages/AdvancedSearch.tsx
// Statut: ❌ À CRÉER
// Description: Recherche avancée emplois
// Fonctionnalités:
// - Formulaire recherche détaillée
// - Appel API: GET /api/offers/search
// - Filtres multiples (mot-clé, ville, type, salaire)
// - Curseur fourchette salaire
// - Sauvegarder recherche
// - Résultats en temps réel
// Temps: 4 heures
```

---

## 👔 4. DASHBOARD RECRUTEUR (4 pages)

**Priorité:** ⭐⭐ IMPORTANT  
**Temps estimé:** 18 heures  
**Assigné à:** Développeur Frontend 2

### Pages:

#### 4.1 Dashboard Recruteur
```typescript
// Fichier: Frontend/src/pages/RecruiterDashboard.tsx
// Statut: ❌ À CRÉER
// Description: Vue d'ensemble recruteur
// Fonctionnalités:
// - Cartes stats (emplois postés, candidatures)
// - Appel API: GET /api/analytics/recruiter/{id}
// - Candidatures récentes
// - Emplois actifs
// - Graphiques (candidatures par emploi)
// - Bouton "Publier Emploi"
// Temps: 6 heures
```

#### 4.2 Publier Emploi
```typescript
// Fichier: Frontend/src/pages/PostJob.tsx
// Statut: ❌ À CRÉER
// Description: Formulaire créer offre
// Fonctionnalités:
// - Formulaire multi-étapes (stepper)
// - Étape 1: Infos de base (titre, type, localisation)
// - Étape 2: Description & salaire
// - Étape 3: Ajouter exigences (dynamique)
// - Étape 4: Prévisualisation
// - Appel API: POST /api/offers
// - Appel API: POST /api/requirements (multiple)
// - Validation formulaire
// - Sauvegarde brouillon (localStorage)
// Temps: 6 heures
```

#### 4.3 Gestion Candidatures
```typescript
// Fichier: Frontend/src/pages/ManageApplications.tsx
// Statut: ❌ À CRÉER
// Description: Gérer candidatures reçues
// Fonctionnalités:
// - Tableau candidatures
// - Appel API: GET /api/recruiters/{id}/offers (puis applications)
// - Filtres (par emploi, par statut)
// - Actions: Accepter/Rejeter
// - Appel API: PUT /api/applications/{id}/status
// - Voir profil candidat
// - Télécharger CV
// - Tri (date, statut)
// Temps: 4 heures
```

#### 4.4 Paramètres Recruteur
```typescript
// Fichier: Frontend/src/pages/RecruiterSettings.tsx
// Statut: ❌ À CRÉER
// Description: Paramètres recruteur
// Fonctionnalités:
// - Modifier infos entreprise
// - Appel API: PUT /api/recruiters/{id}
// - Upload logo entreprise
// - Changer mot de passe
// - Gérer notifications
// Temps: 2 heures
```

---

## 👨‍💼 5. ADMIN PANEL (3 pages)

**Priorité:** ⭐ MOYENNE  
**Temps estimé:** 12 heures  
**Assigné à:** Développeur Frontend 2

### Pages:

#### 5.1 Dashboard Admin
```typescript
// Fichier: Frontend/src/pages/AdminDashboard.tsx
// Statut: ❌ À CRÉER
// Description: Vue d'ensemble admin
// Fonctionnalités:
// - Stats plateforme
// - Appel API: GET /api/admin/stats
// - Graphiques (utilisateurs, emplois, candidatures)
// - Activité récente
// - Emplois en attente modération
// Temps: 4 heures
```

#### 5.2 Gestion Utilisateurs
```typescript
// Fichier: Frontend/src/pages/UserManagement.tsx
// Statut: ❌ À CRÉER
// Description: Gérer utilisateurs
// Fonctionnalités:
// - Tableau utilisateurs
// - Appel API: GET /api/admin/users
// - Filtres (rôle, statut)
// - Recherche
// - Actions: Suspendre/Activer
// - Appel API: PUT /api/admin/users/{id}/status
// - Supprimer utilisateur
// - Appel API: DELETE /api/admin/users/{id}
// - Pagination
// Temps: 5 heures
```

#### 5.3 Modération Contenu
```typescript
// Fichier: Frontend/src/pages/ContentModeration.tsx
// Statut: ❌ À CRÉER
// Description: Modérer offres et candidatures
// Fonctionnalités:
// - Liste offres signalées
// - Actions: Approuver/Rejeter/Supprimer
// - Voir détails offre
// - Notifications modérateurs
// Temps: 3 heures
```

---

## 🧩 6. COMPOSANTS COMMUNS (8 composants)

**Priorité:** ⭐⭐ IMPORTANT  
**Temps estimé:** 12 heures  
**Assigné à:** Frontend 1 & 2 (partager)

### Composants:

#### 6.1 JobCard
```typescript
// Fichier: Frontend/src/components/JobCard.tsx
// Statut: ❌ À CRÉER
// Description: Carte emploi réutilisable
// Props: { job, showActions, onApply, onFavorite }
// Temps: 1.5 heures
```

#### 6.2 LoadingSpinner
```typescript
// Fichier: Frontend/src/components/LoadingSpinner.tsx
// Statut: ❌ À CRÉER
// Description: Indicateur chargement
// Props: { size, color }
// Temps: 0.5 heure
```

#### 6.3 ErrorMessage
```typescript
// Fichier: Frontend/src/components/ErrorMessage.tsx
// Statut: ❌ À CRÉER
// Description: Affichage erreurs
// Props: { message, type }
// Temps: 0.5 heure
```

#### 6.4 Pagination
```typescript
// Fichier: Frontend/src/components/Pagination.tsx
// Statut: ❌ À CRÉER
// Description: Pagination réutilisable
// Props: { currentPage, totalPages, onPageChange }
// Temps: 1.5 heures
```

#### 6.5 SearchBar
```typescript
// Fichier: Frontend/src/components/SearchBar.tsx
// Statut: ❌ À CRÉER
// Description: Barre recherche
// Props: { placeholder, onSearch, filters }
// Temps: 2 heures
```

#### 6.6 CVUpload
```typescript
// Fichier: Frontend/src/components/CVUpload.tsx
// Statut: ❌ À CRÉER
// Description: Upload CV drag & drop
// Fonctionnalités:
// - Drag & drop
// - Validation (PDF, 5MB max)
// - Barre progression
// - Appel API: POST /api/upload/cv
// Temps: 2 heures
```

#### 6.7 ImageUpload
```typescript
// Fichier: Frontend/src/components/ImageUpload.tsx
// Statut: ❌ À CRÉER
// Description: Upload image profil
// Fonctionnalités:
// - Drag & drop
// - Recadrage image
// - Prévisualisation
// - Appel API: POST /api/upload/image
// Temps: 2.5 heures
```

#### 6.8 CandidateProfile
```typescript
// Fichier: Frontend/src/components/CandidateProfile.tsx
// Statut: ❌ À CRÉER
// Description: Profil candidat (pour recruteurs)
// Props: { candidateId }
// Fonctionnalités:
// - Infos candidat
// - Télécharger CV
// - Historique candidatures
// Temps: 1.5 heures
```

---

# 👥 PARTIE 3: RÉPARTITION DES RÔLES

## 📊 STRATÉGIE DE RÉPARTITION

### **Approche Recommandée:**
- **Backend:** Division par domaine fonctionnel
- **Frontend:** Division par type d'utilisateur

---

## 🔧 BACKEND - RÉPARTITION DÉTAILLÉE

### **DÉVELOPPEUR BACKEND 1** (24 endpoints)

**Thème:** Cœur de l'application (Candidats, Offres, Applications)

#### **Semaine 1 (16 endpoints):**
1. ✅ POST /api/auth/profile (1h)
2. ✅ PUT /api/auth/password (1h)
3. ✅ GET /api/dashboard/stats (3h)
4. ✅ GET /api/offers (2h)
5. ✅ GET /api/offers/:id (1h)
6. ✅ POST /api/offers (2h)
7. ✅ PUT /api/offers/:id (1h)
8. ✅ DELETE /api/offers/:id (1h)
9. ✅ GET /api/offers/:id/applications (2h)
10. ✅ GET /api/offers/search (4h)
11. ✅ POST /api/applications (2h)
12. ✅ GET /api/applications/:id (1h)
13. ✅ PUT /api/applications/:id/status (2h)
14. ✅ DELETE /api/applications/:id (1h)
15. ✅ POST /api/requirements (1h)
16. ✅ GET /api/requirements/offer/:offerId (1h)

**Temps total:** ~27 heures

#### **Semaine 2 (8 endpoints):**
17. ✅ DELETE /api/requirements/:id (1h)
18. ✅ GET /api/recruiters (2h)
19. ✅ GET /api/recruiters/:id (1h)
20. ✅ GET /api/recruiters/user/:userId (1h)
21. ✅ PUT /api/recruiters/:id (2h)
22. ✅ GET /api/recruiters/:id/offers (1h)
23. ✅ POST /api/favorites (2h)
24. ✅ GET /api/favorites/candidate/:id (1h)

**Temps total:** ~11 heures

---

### **DÉVELOPPEUR BACKEND 2** (24 endpoints)

**Thème:** Support & Infrastructure (Notifications, Uploads, Admin)

#### **Semaine 1 (12 endpoints):**
1. ✅ GET /api/notifications (2h)
2. ✅ PUT /api/notifications/:id/read (1h)
3. ✅ DELETE /api/notifications/:id (1h)
4. ✅ DELETE /api/favorites/:id (1h)
5. ✅ POST /api/upload/cv (3h)
6. ✅ POST /api/upload/image (2h)
7. ✅ GET /api/uploads/:filename (1h)
8. ✅ DELETE /api/uploads/:filename (1h)
9. ✅ POST /api/job-alerts (2h)
10. ✅ GET /api/job-alerts/user/:userId (1h)
11. ✅ PUT /api/job-alerts/:id (1h)
12. ✅ DELETE /api/job-alerts/:id (1h)

**Temps total:** ~18 heures

#### **Semaine 2 (12 endpoints):**
13. ✅ GET /api/analytics/recruiter/:id (3h)
14. ✅ GET /api/analytics/candidate/:id (2h)
15. ✅ GET /api/admin/users (3h)
16. ✅ DELETE /api/admin/users/:id (1h)
17. ✅ GET /api/admin/stats (3h)
18. ✅ PUT /api/admin/users/:id/status (2h)
19. ✅ POST /api/payments (2h)
20. ✅ GET /api/payments/recruiter/:recruiterId (2h)
21. ✅ GET /api/payments/:id (1h)
22. ✅ Script setup.js base de données (3h)
23. ✅ Script seed.js données test (4h)
24. ✅ Middleware upload.js Multer (2h)

**Temps total:** ~28 heures

---

## 🎨 FRONTEND - RÉPARTITION DÉTAILLÉE

### **DÉVELOPPEUR FRONTEND 1** (13 tâches)

**Thème:** Expérience Candidat & Recherche Emplois

#### **Semaine 1 (9 tâches):**
1. ✅ Dashboard.tsx - Connexion API (4h)
2. ✅ AppliedJobs.tsx - Charger données (3h)
3. ✅ JobListings.tsx (6h)
4. ✅ JobDetails.tsx (5h)
5. ✅ AdvancedSearch.tsx (4h)
6. ✅ JobCard.tsx composant (1.5h)
7. ✅ SearchBar.tsx composant (2h)
8. ✅ Pagination.tsx composant (1.5h)
9. ✅ LoadingSpinner.tsx (0.5h)

**Temps total:** ~27.5 heures

#### **Semaine 2 (4 tâches):**
10. ✅ FavoriteJobs.tsx (4h)
11. ✅ JobAlert.tsx (5h)
12. ✅ Settings.tsx (4h)
13. ✅ CVUpload.tsx + ImageUpload.tsx (4.5h)

**Temps total:** ~17.5 heures

---

### **DÉVELOPPEUR FRONTEND 2** (12 tâches)

**Thème:** Expérience Recruteur & Admin

#### **Semaine 1 (7 tâches):**
1. ✅ RecruiterDashboard.tsx (6h)
2. ✅ PostJob.tsx (6h)
3. ✅ ManageApplications.tsx (4h)
4. ✅ RecruiterSettings.tsx (2h)
5. ✅ CandidateProfile.tsx composant (1.5h)
6. ✅ ErrorMessage.tsx (0.5h)
7. ✅ Ajuster routes App.tsx (1h)

**Temps total:** ~21 heures

#### **Semaine 2 (5 tâches):**
8. ✅ AdminDashboard.tsx (4h)
9. ✅ UserManagement.tsx (5h)
10. ✅ ContentModeration.tsx (3h)
11. ✅ Ajuster redirections basées rôle (2h)
12. ✅ Tests & polissage UI (6h)

**Temps total:** ~20 heures

---

# 📅 PARTIE 4: PLANNING HEBDOMADAIRE

## 📆 SEMAINE 1

### **Objectif:** Fonctionnalités critiques (candidat peut postuler)

| Rôle | Lundi | Mardi | Mercredi | Jeudi | Vendredi |
|------|-------|-------|----------|-------|----------|
| **BE1** | Dashboard stats<br>Offers GET | Offers POST/PUT<br>Applications | Applications<br>Requirements | Offers search<br>Tests | Debug<br>Documentation |
| **BE2** | Notifications<br>Favorites | Uploads CV/Image | Job Alerts<br>Setup DB | Seed data<br>Tests | Debug<br>Documentation |
| **FE1** | Dashboard API<br>Applied Jobs | Job Listings | Job Details | Advanced Search | Tests<br>Composants |
| **FE2** | Recruiter Dashboard | Post Job (1/2) | Post Job (2/2)<br>Manage Apps | Recruiter Settings | Tests<br>Routes |

---

## 📆 SEMAINE 2

### **Objectif:** Fonctionnalités avancées

| Rôle | Lundi | Mardi | Mercredi | Jeudi | Vendredi |
|------|-------|-------|----------|-------|----------|
| **BE1** | Requirements DELETE<br>Recruiters | Recruiters endpoints | Favorites | Tests integration | Debug & Polish |
| **BE2** | Analytics | Admin endpoints | Payments | Tests integration | Debug & Polish |
| **FE1** | Favorite Jobs | Job Alerts | Settings + Uploads | Tests | Polish UI |
| **FE2** | Admin Dashboard | User Management | Content Moderation | Tests | Polish UI |

---

## 📆 SEMAINE 3

### **Objectif:** Tests & Optimisation

| Rôle | Lundi-Mardi | Mercredi-Jeudi | Vendredi |
|------|-------------|----------------|----------|
| **Tous** | Tests E2E<br>Bug fixes | Performance<br>Optimisation | Code review<br>Documentation |

---

## 📆 SEMAINE 4

### **Objectif:** Déploiement

| Rôle | Lundi-Mardi | Mercredi-Jeudi | Vendredi |
|------|-------------|----------------|----------|
| **Backend** | Déploiement prep | Déploiement | Tests prod |
| **Frontend** | Build production | Déploiement | Tests prod |

---

# 📋 PARTIE 5: CHECKLIST PAR RÔLE

## ✅ BACKEND DEV 1 - CHECKLIST

### **Endpoints à créer:**
- [ ] GET /api/auth/profile
- [ ] PUT /api/auth/password
- [ ] GET /api/dashboard/stats
- [ ] GET /api/offers
- [ ] GET /api/offers/:id
- [ ] POST /api/offers
- [ ] PUT /api/offers/:id
- [ ] DELETE /api/offers/:id
- [ ] GET /api/offers/:id/applications
- [ ] GET /api/offers/search
- [ ] POST /api/applications
- [ ] GET /api/applications/:id
- [ ] PUT /api/applications/:id/status
- [ ] DELETE /api/applications/:id
- [ ] POST /api/requirements
- [ ] GET /api/requirements/offer/:offerId
- [ ] DELETE /api/requirements/:id
- [ ] GET /api/recruiters
- [ ] GET /api/recruiters/:id
- [ ] GET /api/recruiters/user/:userId
- [ ] PUT /api/recruiters/:id
- [ ] GET /api/recruiters/:id/offers
- [ ] POST /api/favorites
- [ ] GET /api/favorites/candidate/:id

### **Fichiers à créer:**
- [ ] Backend/controllers/dashboardController.js
- [ ] Backend/controllers/offerController.js
- [ ] Backend/controllers/applicationController.js
- [ ] Backend/controllers/requirementController.js
- [ ] Backend/controllers/recruiterController.js
- [ ] Backend/controllers/favoriteController.js
- [ ] Backend/routes/dashboardRoutes.js
- [ ] Backend/routes/offerRoutes.js
- [ ] Backend/routes/applicationRoutes.js
- [ ] Backend/routes/requirementRoutes.js
- [ ] Backend/routes/recruiterRoutes.js
- [ ] Backend/routes/favoriteRoutes.js

### **Méthodes modèles à ajouter:**
- [ ] Application.countByCandidate()
- [ ] Application.findByCandidateWithOffer()
- [ ] Candidate.findByUserId() retournant ID
- [ ] Créer modèle Favorite.js

---

## ✅ BACKEND DEV 2 - CHECKLIST

### **Endpoints à créer:**
- [ ] GET /api/notifications
- [ ] PUT /api/notifications/:id/read
- [ ] DELETE /api/notifications/:id
- [ ] DELETE /api/favorites/:id
- [ ] POST /api/upload/cv
- [ ] POST /api/upload/image
- [ ] GET /api/uploads/:filename
- [ ] DELETE /api/uploads/:filename
- [ ] POST /api/job-alerts
- [ ] GET /api/job-alerts/user/:userId
- [ ] PUT /api/job-alerts/:id
- [ ] DELETE /api/job-alerts/:id
- [ ] GET /api/analytics/recruiter/:id
- [ ] GET /api/analytics/candidate/:id
- [ ] GET /api/admin/users
- [ ] DELETE /api/admin/users/:id
- [ ] GET /api/admin/stats
- [ ] PUT /api/admin/users/:id/status
- [ ] POST /api/payments
- [ ] GET /api/payments/recruiter/:recruiterId
- [ ] GET /api/payments/:id

### **Fichiers à créer:**
- [ ] Backend/controllers/notificationController.js
- [ ] Backend/controllers/uploadController.js
- [ ] Backend/controllers/jobAlertController.js
- [ ] Backend/controllers/analyticsController.js
- [ ] Backend/controllers/adminController.js
- [ ] Backend/controllers/paymentController.js
- [ ] Backend/routes/notificationRoutes.js
- [ ] Backend/routes/uploadRoutes.js
- [ ] Backend/routes/jobAlertRoutes.js
- [ ] Backend/routes/analyticsRoutes.js
- [ ] Backend/routes/adminRoutes.js
- [ ] Backend/routes/paymentRoutes.js
- [ ] Backend/middleware/upload.js
- [ ] Backend/database/setup.js
- [ ] Backend/database/seed.js

### **Tables SQL à créer:**
- [ ] CREATE TABLE favorites
- [ ] CREATE TABLE job_alerts

### **Méthodes modèles à ajouter:**
- [ ] Notification.findByUser()
- [ ] Notification.countUnreadByUser()
- [ ] Notification.markAsRead()
- [ ] Créer modèle Favorite.js
- [ ] Créer modèle JobAlert.js

---

## ✅ FRONTEND DEV 1 - CHECKLIST

### **Pages à créer/modifier:**
- [ ] Dashboard.tsx (connecter API)
- [ ] AppliedJobs.tsx (charger données)
- [ ] JobListings.tsx
- [ ] JobDetails.tsx
- [ ] AdvancedSearch.tsx
- [ ] FavoriteJobs.tsx
- [ ] JobAlert.tsx
- [ ] Settings.tsx

### **Composants à créer:**
- [ ] JobCard.tsx
- [ ] SearchBar.tsx
- [ ] Pagination.tsx
- [ ] LoadingSpinner.tsx
- [ ] CVUpload.tsx
- [ ] ImageUpload.tsx

### **Routes à ajouter (App.tsx):**
- [ ] /jobs
- [ ] /jobs/:id
- [ ] /search
- [ ] /favorites
- [ ] /alerts
- [ ] /settings

---

## ✅ FRONTEND DEV 2 - CHECKLIST

### **Pages à créer:**
- [ ] RecruiterDashboard.tsx
- [ ] PostJob.tsx
- [ ] ManageApplications.tsx
- [ ] RecruiterSettings.tsx
- [ ] AdminDashboard.tsx
- [ ] UserManagement.tsx
- [ ] ContentModeration.tsx

### **Composants à créer:**
- [ ] CandidateProfile.tsx
- [ ] ErrorMessage.tsx

### **Routes à ajouter (App.tsx):**
- [ ] /recruiter/dashboard
- [ ] /recruiter/post-job
- [ ] /recruiter/applications
- [ ] /recruiter/settings
- [ ] /admin/dashboard
- [ ] /admin/users
- [ ] /admin/moderation

### **Logique à implémenter:**
- [ ] Redirections basées sur rôle après login
- [ ] Protection routes par rôle
- [ ] Ajuster signup/signin pour rediriger selon rôle

---

# 🎯 PARTIE 6: CRITÈRES DE SUCCÈS

## ✅ DÉFINITION OF DONE

### **Un endpoint backend est "DONE" quand:**
- [ ] Code écrit et testé avec Postman
- [ ] Format réponse: `{ success: true/false, data: {...} }`
- [ ] Codes statut HTTP corrects (200, 201, 400, 401, 500)
- [ ] JWT vérifié si route protégée
- [ ] Gestion d'erreurs (try/catch)
- [ ] Logs console pour debug
- [ ] Route ajoutée dans index.js
- [ ] Documenté (commentaires)

### **Une page frontend est "DONE" quand:**
- [ ] Code écrit et compilé sans erreur
- [ ] UI responsive (mobile + desktop)
- [ ] Appels API fonctionnels
- [ ] États de chargement (loading)
- [ ] Gestion d'erreurs (messages)
- [ ] Validation formulaires
- [ ] Navigation fonctionnelle
- [ ] Pas d'erreurs console
- [ ] Tests manuels réussis

---

# 📊 PARTIE 7: MÉTRIQUES & SUIVI

## 📈 INDICATEURS DE PROGRESSION

### **Semaine 1:**
- **Backend:** 28/48 endpoints (58%)
- **Frontend:** 9/25 pages (36%)

### **Semaine 2:**
- **Backend:** 44/48 endpoints (92%)
- **Frontend:** 17/25 pages (68%)

### **Semaine 3:**
- **Backend:** 48/48 endpoints (100%)
- **Frontend:** 25/25 pages (100%)
- **Tests:** En cours

### **Semaine 4:**
- **Déploiement:** 100%
- **Documentation:** 100%

---

# 🆘 PARTIE 8: SUPPORT & RESSOURCES

## 📞 QUI CONTACTER?

### **Problèmes Base de Données:**
→ Backend Dev 2 (gère setup.js et seed.js)

### **Problèmes API/Endpoints:**
→ Backend Dev 1 ou 2 selon qui a créé l'endpoint

### **Problèmes Frontend/UI:**
→ Frontend Dev 1 (candidat) ou 2 (recruteur)

### **Problèmes Git/Merge:**
→ Réunion équipe complète

---

## 📚 DOCUMENTATION UTILE

### **Backend:**
- Express.js: https://expressjs.com/
- JWT: https://jwt.io/
- Multer: https://github.com/expressjs/multer
- MySQL: https://dev.mysql.com/doc/

### **Frontend:**
- React: https://react.dev/
- React Router: https://reactrouter.com/
- TypeScript: https://www.typescriptlang.org/

---

# 🎉 CONCLUSION

## 📋 RÉSUMÉ

**Ce document contient:**
- ✅ 48 endpoints API détaillés
- ✅ 25 pages/composants Frontend détaillés
- ✅ Répartition complète Backend Dev 1 & 2
- ✅ Répartition complète Frontend Dev 1 & 2
- ✅ Planning 4 semaines
- ✅ Checklists par rôle
- ✅ Critères de succès

**Tout est défini, il ne reste plus qu'à coder!** 🚀

---

**Document créé le:** [Date]  
**Version:** 1.0  
**Projet:** JobsPlatform  
**Équipe:** 4 développeurs (2 Backend + 2 Frontend)

---

**Bonne chance à tous! 💪**

