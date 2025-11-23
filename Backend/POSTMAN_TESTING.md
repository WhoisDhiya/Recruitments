# 📬 Guide de Test avec Postman

## 🚀 Démarrage du serveur
```bash
npm start
```
Le serveur démarre sur : **http://localhost:3000**

---

## ✅ Tests avec Postman

### 1️⃣ **Inscription d'un CANDIDAT**

**Méthode :** `POST`  
**URL :** `http://localhost:3000/api/auth/signup`  
**Headers :** 
```
Content-Type: application/json
```

**Body (JSON) :**
```json
{
  "last_name": "Dupont",
  "first_name": "Jean",
  "email": "jean.dupont@gmail.com",
  "password": "MonMotDePasse123",
  "role": "candidate",
  "cv": "cv_jean_dupont.pdf",
  "image": "photo_jean.jpg"
}
```

**Réponse attendue (201) :**
```json
{
  "status": "SUCCESS",
  "message": "Inscription réussie",
  "data": {
    "user_id": 1,
    "profile_id": 1,
    "email": "jean.dupont@gmail.com",
    "role": "candidate"
  }
}
```

---

### 2️⃣ **Inscription d'un RECRUTEUR**

**Méthode :** `POST`  
**URL :** `http://localhost:3000/api/auth/signup`  
**Headers :** 
```
Content-Type: application/json
```

**Body (JSON) :**
```json
{
  "last_name": "Martin",
  "first_name": "Sophie",
  "email": "sophie.martin@entreprise.com",
  "password": "RecruteurPass123",
  "role": "recruiter",
  "company_name": "TechCorp",
  "industry": "Technologie",
  "description": "Entreprise de développement logiciel",
  "company_email": "contact@techcorp.com",
  "company_address": "123 Rue de Paris, 75001 Paris"
}
```

**Réponse attendue (201) :**
```json
{
  "status": "SUCCESS",
  "message": "Inscription réussie",
  "data": {
    "user_id": 2,
    "profile_id": 1,
    "email": "sophie.martin@entreprise.com",
    "role": "recruiter"
  }
}
```

---

### 3️⃣ **Inscription d'un ADMIN**

**Méthode :** `POST`  
**URL :** `http://localhost:3000/api/auth/signup`  
**Headers :** 
```
Content-Type: application/json
```

**Body (JSON) :**
```json
{
  "last_name": "Admin",
  "first_name": "Super",
  "email": "admin@platform.com",
  "password": "AdminPass123",
  "role": "admin"
}
```

**Réponse attendue (201) :**
```json
{
  "status": "SUCCESS",
  "message": "Inscription réussie",
  "data": {
    "user_id": 3,
    "profile_id": 1,
    "email": "admin@platform.com",
    "role": "admin"
  }
}
```

---

## ❌ Cas d'erreurs à tester

### Email déjà utilisé
**Body :**
```json
{
  "last_name": "Test",
  "first_name": "User",
  "email": "jean.dupont@gmail.com",
  "password": "password123",
  "role": "candidate"
}
```

**Réponse attendue (409) :**
```json
{
  "status": "ERROR",
  "message": "Cet email est déjà utilisé"
}
```

---

### Champ manquant
**Body :**
```json
{
  "last_name": "Test",
  "email": "test@gmail.com",
  "password": "password123",
  "role": "candidate"
}
```

**Réponse attendue (400) :**
```json
{
  "status": "ERROR",
  "message": "Tous les champs sont requis (last_name, first_name, email, password, role)"
}
```

---

### Rôle invalide
**Body :**
```json
{
  "last_name": "Test",
  "first_name": "User",
  "email": "test@gmail.com",
  "password": "password123",
  "role": "invalid_role"
}
```

**Réponse attendue (400) :**
```json
{
  "status": "ERROR",
  "message": "Rôle invalide. Utilisez: candidate, recruiter ou admin"
}
```

---

### Recruteur sans company_name
**Body :**
```json
{
  "last_name": "Test",
  "first_name": "User",
  "email": "test@gmail.com",
  "password": "password123",
  "role": "recruiter"
}
```

**Réponse attendue (400) :**
```json
{
  "status": "ERROR",
  "message": "Le nom de l'entreprise (company_name) est requis pour un recruteur"
}
```

---

## 🔍 Autres routes disponibles

### Vérifier la santé de l'API
**GET** `http://localhost:3000/api/health`

### Page d'accueil
**GET** `http://localhost:3000/`

---

## 📝 Notes importantes

1. **Champs obligatoires pour TOUS les rôles :**
   - `last_name`
   - `first_name`
   - `email`
   - `password`
   - `role`

2. **Champ obligatoire pour RECRUTEUR :**
   - `company_name`

3. **Champs optionnels pour CANDIDAT :**
   - `cv`
   - `image`

4. **Champs optionnels pour RECRUTEUR :**
   - `industry`
   - `description`
   - `company_email`
   - `company_address`

5. **Rôles valides :**
   - `candidate`
   - `recruiter`
   - `admin`

