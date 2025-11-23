# Settings Page Implementation - Documentation

## Overview
Une page **Settings** complète a été implémentée avec 4 sections principales (Personal, Profile, Social Links, Account Settings) accessibles depuis tous les dashboards via la navbar.

## Features Implémentées

### 1. **Page Settings (Settings.tsx)**
- **4 onglets de configuration:**
  - 📋 **Personal**: Informations personnelles (Prénom, Nom, Email, Téléphone, Date de naissance, Sexe, Nationalité)
  - 👤 **Profile**: Profil utilisateur (Photo de profil, Adresse, Ville, Code postal, Pays, Bio)
  - 🔗 **Social Links**: Liens réseaux sociaux (LinkedIn, Twitter, Facebook, Instagram, Portfolio)
  - ⚙️ **Account Settings**: Paramètres de compte
    - Gestion du mot de passe (Mot de passe actuel, Nouveau mot de passe, Confirmation)
    - Préférences de notifications (Email, SMS, Push, Job Alerts)

### 2. **Styling (Settings.css)**
- Design moderne et responsive
- Animation smooth lors du changement d'onglets
- Message de confirmation pour les changements enregistrés
- Interface tactile pour les appareils mobiles
- Support complet des checkboxes et inputs

### 3. **Intégration Routage**
- ✅ Route `/settings` ajoutée dans `App.tsx`
- ✅ Navigation depuis **Dashboard** (Candidate)
- ✅ Navigation depuis **RecruiterDashboard**
- ✅ Navigation depuis **AdminDashboard**

### 4. **Navigation depuis les Dashboards**

#### Dashboard (Candidate)
```tsx
onClick={(e) => {
  e.preventDefault();
  if (item.id === 'Settings') {
    navigate('/settings');
  } else {
    setActiveTab(item.id as ActiveTab);
  }
}}
```

#### RecruiterDashboard
```tsx
onClick={(e) => {
  e.preventDefault();
  if (item.id === 'Settings') {
    navigate('/settings');
  } else if (item.id === 'Post_a_Job') {
    navigate('/post-job');
  } else {
    setActiveTab(item.id);
  }
}}
```

#### AdminDashboard
```tsx
onClick={() => navigate('/settings')}
```

## Structure des Fichiers

```
Frontend/src/
├── pages/
│   ├── Settings.tsx          (NEW - Composant principal)
│   ├── Settings.css          (NEW - Styles)
│   ├── Dashboard.tsx         (UPDATED - Navigation vers Settings)
│   ├── RecruiterDashboard.tsx (UPDATED - Navigation vers Settings)
│   └── AdminDashboard.tsx    (UPDATED - Navigation vers Settings)
└── App.tsx                   (UPDATED - Route /settings)
```

## Fonctionnalités de la Page Settings

### Personal Section
- Édition des informations personnelles de base
- Bouton "Save Changes" pour enregistrer

### Profile Section
- Upload de photo de profil
- Édition des informations d'adresse
- Bio utilisateur (textarea)

### Social Links Section
- Intégration avec icônes colorées pour chaque réseau
- URLs de profils sociaux
- Lien du portfolio personnel

### Account Settings Section
- **Change Password**
  - Toggle pour afficher/masquer le mot de passe
  - Validation du mot de passe actuel
  
- **Notification Preferences**
  - Email Notifications
  - SMS Notifications
  - Push Notifications
  - Job Alerts

## État du Formulaire
Tous les champs sont gérés avec `useState` pour permettre:
- L'édition en temps réel
- L'enregistrement des modifications
- L'affichage de messages de confirmation

## Responsive Design
- ✅ Desktop (Full layout)
- ✅ Tablet (Grille adaptée)
- ✅ Mobile (Onglets à 1 colonne)

## Comment Accéder à la Page Settings

1. **Depuis le Dashboard (Candidate)**
   - Cliquer sur ⚙️ Settings dans la sidebar

2. **Depuis le RecruiterDashboard**
   - Cliquer sur ⚙️ Settings dans la sidebar

3. **Depuis l'AdminDashboard**
   - Cliquer sur ⚙️ Settings dans la sidebar gauche

## Prochaines Étapes (Optionnel)

Pour une intégration complète, vous pourriez:
1. Connecter les formulaires à l'API Backend
2. Implémenter la validation des formulaires côté client
3. Ajouter des messages d'erreur personnalisés
4. Implémenter la pagination pour les préférences de notification
5. Ajouter une photo de profil avec prévisualisation
6. Implémenter la suppression de compte

## Notes Téchniques

- Utilise React Router `useNavigate()` pour la navigation
- Utilise React Hooks (`useState`) pour la gestion d'état
- Icônes de `lucide-react`
- CSS pur sans dépendances externes
- Compatible avec TypeScript
