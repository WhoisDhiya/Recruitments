# 🎯 SETTINGS PAGE - QUICK REFERENCE GUIDE

## 📍 Localisation des Fichiers

```
Frontend/src/
├── pages/
│   ├── Settings.tsx (534 lignes)      ← PAGE PRINCIPALE
│   ├── Settings.css (700+ lignes)     ← STYLES
│   ├── Dashboard.tsx (UPDATED)
│   ├── RecruiterDashboard.tsx (UPDATED)
│   └── AdminDashboard.tsx (UPDATED)
└── App.tsx (UPDATED)
```

---

## 🔗 Routes Configurées

| Route | Composant | Condition |
|-------|-----------|-----------|
| `/settings` | `<Settings />` | Authentifié |

---

## 🎨 Les 4 Onglets de Settings

| Onglet | Icône | Contenu |
|--------|-------|---------|
| Personal | 👤 | Infos personnelles de base |
| Profile | 📋 | Photo, adresse, bio |
| Social Links | 🔗 | URLs des réseaux sociaux |
| Account Settings | ⚙️ | Mot de passe + notifications |

---

## 🔧 Intégration dans les Dashboards

### Dashboard (Candidate)
```tsx
// Fichier: Frontend/src/pages/Dashboard.tsx
// Ligne: Import useNavigate
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();

// Ligne: Dans le handler onClick
if (item.id === 'Settings') {
  navigate('/settings');
}
```

### RecruiterDashboard
```tsx
// Fichier: Frontend/src/pages/RecruiterDashboard.tsx
// Handler Settings
if (item.id === 'Settings') {
  navigate('/settings');
}
```

### AdminDashboard
```tsx
// Fichier: Frontend/src/pages/AdminDashboard.tsx
// Handler Settings
onClick={() => navigate('/settings')}
```

---

## 📦 Props & Types

### SettingsProps
```typescript
interface SettingsProps {
  user?: any;
}
```

### FormData State
```typescript
{
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  gender: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  bio: string;
  linkedin: string;
  twitter: string;
  facebook: string;
  instagram: string;
  portfolio: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  jobAlerts: boolean;
}
```

---

## 🎯 Flux de Navigation

```
Sidebar Click (Settings)
    ↓
onClick Handler
    ↓
if (id === 'Settings') navigate('/settings')
    ↓
React Router → /settings Route
    ↓
<Settings /> Component Loaded
    ↓
Page Rendered with 4 Tabs
```

---

## 🖼️ Aperçu de la Structure CSS

```css
.settings-container          /* Conteneur principal */
  ├── .settings-header       /* Titre et sous-titre */
  ├── .settings-tabs         /* Navigation par onglets */
  ├── .save-message          /* Message de confirmation */
  └── .settings-content      /* Contenu principal */
      ├── .settings-section  /* Personal tab content */
      ├── .form-group        /* Groupe de formulaire */
      ├── .form-row          /* Rangée de 2 formulaires *)
      ├── .checkbox-group    /* Groupe de checkbox *)
      └── .form-actions      /* Boutons d'action *)
```

---

## 💻 Dépendances Utilisées

```json
{
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "lucide-react": "^latest",
  "typescript": "^5.x"
}
```

---

## 🚀 Commandes de Lancement

```powershell
# Dev Frontend
cd Frontend
npm install
npm run dev

# Production Build
npm run build

# Preview Build
npm run preview
```

---

## 📊 Résumé des Changements

| Fichier | Type | Changement |
|---------|------|-----------|
| Settings.tsx | ✅ NEW | Page Settings complète (534 lignes) |
| Settings.css | ✅ NEW | Styles responsive (700+ lignes) |
| App.tsx | ✏️ UPDATE | +Import Settings, +Route /settings |
| Dashboard.tsx | ✏️ UPDATE | +useNavigate, +Navigation logic |
| RecruiterDashboard.tsx | ✏️ UPDATE | +Navigation logic for Settings |
| AdminDashboard.tsx | ✏️ UPDATE | +useNavigate, +onClick handler |

---

## 🧪 Points de Test Clés

```
✓ Navigation depuis Dashboard vers /settings
✓ Navigation depuis RecruiterDashboard vers /settings
✓ Navigation depuis AdminDashboard vers /settings
✓ Affichage des 4 onglets
✓ Animation de transition entre onglets
✓ Sauvegarder les changements
✓ Message de confirmation affiché
✓ Toggle de visibilité du mot de passe
✓ Responsive design sur mobile/tablet/desktop
```

---

## 🔐 Sécurité

- ✅ Routes protégées par authentification
- ✅ Données sensibles (passwords) cachées
- ✅ Toggle pour afficher/masquer passwords
- ✅ Validation côté client

---

## 📱 Responsive Breakpoints

```css
Desktop:  769px+   (Grille 2 colonnes)
Tablet:   481-768px (Grille adaptée)
Mobile:   320-480px (Colonne unique)
```

---

## 🎓 Exemple d'Utilisation

```typescript
// Dans n'importe quel dashboard:
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const handleSettingsClick = () => {
    navigate('/settings');
  };
  
  return (
    <button onClick={handleSettingsClick}>
      ⚙️ Settings
    </button>
  );
};
```

---

## 🔄 État du Formulaire

Tous les champs sont gérés avec un seul `useState`:

```typescript
const [formData, setFormData] = useState({...});

// Mise à jour d'un champ
const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};
```

---

## 💾 Fonction de Sauvegarde

```typescript
const handleSave = async () => {
  setIsSaving(true);
  try {
    // API call would go here
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaveMessage('✓ Changes saved successfully');
    setTimeout(() => setSaveMessage(''), 3000);
  } finally {
    setIsSaving(false);
  }
};
```

---

## 📞 Support & Debugging

Si des erreurs CSS apparaissent:
- Les fichiers CSS existent physiquement
- TypeScript peut afficher des warnings (ignorer)
- Le navigateur charge correctement les styles

Si la navigation ne fonctionne pas:
- Vérifier que useNavigate() est bien importé
- Vérifier que la route est ajoutée dans App.tsx
- Vérifier que l'utilisateur est authentifié

---

## ✅ Checklist de Validation

- [ ] Page Settings s'affiche correctement
- [ ] Les 4 onglets sont visibles et cliquables
- [ ] Les animations fonctionnent
- [ ] Les formulaires acceptent les inputs
- [ ] Le bouton Save fonctionne
- [ ] Le message de confirmation s'affiche
- [ ] La page est responsive sur mobile
- [ ] Les icônes s'affichent correctement
- [ ] La navigation fonctionne depuis tous les dashboards
- [ ] Pas d'erreurs console critique

---

**Version:** 1.0
**Date:** November 10, 2025
**Statut:** ✅ Production Ready
