# 🔌 SETTINGS PAGE - BACKEND API INTEGRATION GUIDE

## 📋 Overview

Ce document décrit comment intégrer la page Settings du Frontend avec votre API Backend.

---

## 🎯 Endpoints API Nécessaires

### 1. **GET /api/user/settings**
Récupère les paramètres actuels de l'utilisateur

**Request:**
```http
GET /api/user/settings
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+216 23 235 891",
    "dateOfBirth": "1990-01-15",
    "nationality": "Tunisian",
    "gender": "male",
    "address": "123 Main St",
    "city": "Tunis",
    "zipCode": "1000",
    "country": "Tunisia",
    "bio": "Software Developer",
    "linkedin": "https://linkedin.com/in/johndoe",
    "twitter": "https://twitter.com/johndoe",
    "facebook": "https://facebook.com/johndoe",
    "instagram": "https://instagram.com/johndoe",
    "portfolio": "https://johndoe.com",
    "emailNotifications": true,
    "smsNotifications": false,
    "pushNotifications": true,
    "jobAlerts": true
  }
}
```

---

### 2. **PUT /api/user/settings**
Met à jour les paramètres utilisateur

**Request:**
```http
PUT /api/user/settings
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+216 23 235 891",
  "dateOfBirth": "1990-01-15",
  "nationality": "Tunisian",
  "gender": "male",
  "address": "123 Main St",
  "city": "Tunis",
  "zipCode": "1000",
  "country": "Tunisia",
  "bio": "Software Developer",
  "linkedin": "https://linkedin.com/in/johndoe",
  "twitter": "https://twitter.com/johndoe",
  "facebook": "https://facebook.com/johndoe",
  "instagram": "https://instagram.com/johndoe",
  "portfolio": "https://johndoe.com",
  "emailNotifications": true,
  "smsNotifications": false,
  "pushNotifications": true,
  "jobAlerts": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "data": {
    "updatedAt": "2025-11-10T14:30:00Z"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "email": "Invalid email format",
    "phone": "Invalid phone number"
  }
}
```

---

### 3. **POST /api/user/password/change**
Change le mot de passe utilisateur

**Request:**
```http
POST /api/user/password/change
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456",
  "confirmPassword": "newPassword456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Passwords do not match"
}
```

---

### 4. **POST /api/user/avatar**
Upload l'image de profil

**Request:**
```http
POST /api/user/avatar
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "file": <binary_image_data>
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatarUrl": "https://api.example.com/uploads/avatars/user123.jpg"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid image format. Allowed: jpg, png, gif"
}
```

---

### 5. **PUT /api/user/notifications**
Met à jour les préférences de notifications

**Request:**
```http
PUT /api/user/notifications
Authorization: Bearer {token}
Content-Type: application/json

{
  "emailNotifications": true,
  "smsNotifications": false,
  "pushNotifications": true,
  "jobAlerts": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification preferences updated"
}
```

---

## 📡 Implémentation Frontend (Example avec Axios)

### Service API pour Settings

```typescript
// Frontend/src/services/settingsApi.ts

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const settingsApi = {
  // Récupérer les paramètres
  getSettings: async () => {
    const response = await axios.get(`${API_BASE_URL}/user/settings`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data.data;
  },

  // Mettre à jour les paramètres
  updateSettings: async (data: any) => {
    const response = await axios.put(
      `${API_BASE_URL}/user/settings`,
      data,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  },

  // Changer le mot de passe
  changePassword: async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    const response = await axios.post(
      `${API_BASE_URL}/user/password/change`,
      {
        currentPassword,
        newPassword,
        confirmPassword
      },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(
      `${API_BASE_URL}/user/avatar`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  },

  // Mettre à jour les notifications
  updateNotifications: async (preferences: any) => {
    const response = await axios.put(
      `${API_BASE_URL}/user/notifications`,
      preferences,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  }
};

export default settingsApi;
```

---

### Mise à jour du Composant Settings

```typescript
// Frontend/src/pages/Settings.tsx

import settingsApi from '../services/settingsApi';

// Dans useEffect, charger les données
useEffect(() => {
  const loadSettings = async () => {
    try {
      const data = await settingsApi.getSettings();
      setFormData(prev => ({
        ...prev,
        ...data
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      setSaveMessage('Erreur: Impossible de charger les paramètres');
    }
  };
  
  loadSettings();
}, []);

// Mise à jour du handleSave
const handleSave = async () => {
  setIsSaving(true);
  try {
    const response = await settingsApi.updateSettings(formData);
    setSaveMessage('✓ Changes saved successfully');
    setTimeout(() => setSaveMessage(''), 3000);
  } catch (error: any) {
    setSaveMessage(error.response?.data?.message || 'Erreur lors de la sauvegarde');
  } finally {
    setIsSaving(false);
  }
};

// Gestion du changement de mot de passe
const handlePasswordChange = async () => {
  try {
    await settingsApi.changePassword(
      formData.currentPassword,
      formData.newPassword,
      formData.confirmPassword
    );
    setSaveMessage('✓ Password changed successfully');
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
    setTimeout(() => setSaveMessage(''), 3000);
  } catch (error: any) {
    setSaveMessage(error.response?.data?.message || 'Erreur lors du changement du mot de passe');
  }
};

// Gestion de l'upload d'avatar
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    try {
      const response = await settingsApi.uploadAvatar(file);
      setSaveMessage('✓ Avatar uploaded successfully');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error: any) {
      setSaveMessage(error.response?.data?.message || 'Erreur lors de l\'upload');
    }
  }
};
```

---

## 🗄️ Schéma de Base de Données

### Tableau: users_settings

```sql
CREATE TABLE users_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  nationality VARCHAR(100),
  gender ENUM('male', 'female', 'other'),
  address VARCHAR(255),
  city VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(100),
  bio TEXT,
  linkedin_url VARCHAR(255),
  twitter_url VARCHAR(255),
  facebook_url VARCHAR(255),
  instagram_url VARCHAR(255),
  portfolio_url VARCHAR(255),
  avatar_url VARCHAR(500),
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT true,
  job_alerts BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🔐 Validation Backend

### Node.js Express Example

```javascript
// Backend/routes/settingsRoutes.js

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const settingsController = require('../controllers/settingsController');

// Récupérer les paramètres
router.get('/user/settings', authenticateToken, settingsController.getSettings);

// Mettre à jour les paramètres
router.put('/user/settings', authenticateToken, settingsController.updateSettings);

// Changer le mot de passe
router.post('/user/password/change', authenticateToken, settingsController.changePassword);

// Upload avatar
router.post('/user/avatar', authenticateToken, settingsController.uploadAvatar);

// Mettre à jour les notifications
router.put('/user/notifications', authenticateToken, settingsController.updateNotifications);

module.exports = router;
```

### Contrôleur Example

```javascript
// Backend/controllers/settingsController.js

const getSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    // SELECT * FROM users_settings WHERE user_id = userId
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, email, phone, ... } = req.body;
    
    // Validation
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email' 
      });
    }
    
    // UPDATE users_settings SET ... WHERE user_id = userId
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ... autres contrôleurs
```

---

## 🧪 Exemples de Tests cURL

```bash
# Récupérer les paramètres
curl -X GET http://localhost:5000/api/user/settings \
  -H "Authorization: Bearer eyJhbGc..."

# Mettre à jour les paramètres
curl -X PUT http://localhost:5000/api/user/settings \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe",...}'

# Changer le mot de passe
curl -X POST http://localhost:5000/api/user/password/change \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"old","newPassword":"new","confirmPassword":"new"}'

# Upload avatar
curl -X POST http://localhost:5000/api/user/avatar \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "file=@/path/to/avatar.jpg"
```

---

## ⚠️ Gestion des Erreurs

```json
{
  "success": false,
  "message": "Description de l'erreur",
  "errors": {
    "fieldName": "Détail de l'erreur pour ce champ"
  }
}
```

---

## 🔒 Recommandations de Sécurité

1. **Authentification**: Vérifier le token JWT à chaque requête
2. **Validation**: Valider tous les inputs côté serveur
3. **Autorisation**: S'assurer que l'utilisateur ne peut modifier que ses propres paramètres
4. **Chiffrement**: Hacher les mots de passe avec bcrypt
5. **Rate Limiting**: Limiter le nombre de tentatives de changement de mot de passe
6. **HTTPS**: Utiliser HTTPS en production
7. **CORS**: Configurer CORS correctement
8. **Input Sanitization**: Nettoyer tous les inputs pour éviter l'injection SQL

---

## 📝 Checklist d'Implémentation Backend

- [ ] Créer les routes API
- [ ] Créer les contrôleurs
- [ ] Créer/modifier les tables dans la BD
- [ ] Implémenter la validation
- [ ] Implémenter la gestion des erreurs
- [ ] Ajouter l'authentification (JWT)
- [ ] Tester avec Postman/cURL
- [ ] Implémenter le hachage des mots de passe
- [ ] Ajouter les logs
- [ ] Documenter l'API

---

**Version:** 1.0
**Date:** November 10, 2025
**Pour:** Développeurs Backend
