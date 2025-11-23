# 🎨 Frontend - JobsPlatform

Application Frontend React + TypeScript + Tailwind CSS pour la plateforme de recrutement RecruPlus.

## 🚀 Technologies utilisées

- **React 19** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Vite** - Build tool et dev server ultra-rapide
- **Tailwind CSS** - Framework CSS utility-first
- **React Router DOM** - Navigation
- **Lucide React** - Icônes modernes
- **Axios** - Requêtes HTTP

## 📦 Installation

```bash
# Installer les dépendances
npm install
```

## 🏃 Démarrage

### Mode développement
```bash
npm run dev
```
L'application démarrera sur **http://localhost:5173**

### Build de production
```bash
npm run build
```

### Prévisualisation du build
```bash
npm run preview
```

## 📁 Structure du projet

```
Frontend/
├── src/
│   ├── api/              # Appels API vers le backend
│   │   └── api.ts        # Fonctions API (health, offers)
│   ├── pages/            # Pages de l'application
│   │   ├── homepage.tsx  # Page d'accueil
│   │   └── signup.tsx    # Page d'inscription
│   ├── App.tsx           # Composant principal avec routing
│   ├── main.tsx          # Point d'entrée
│   └── index.css         # Styles globaux Tailwind
├── public/               # Assets statiques
└── package.json
```

## 🎯 Pages disponibles

### 1. Homepage (`/`)
- Hero section avec recherche d'emploi
- Statistiques de la plateforme
- Catégories populaires d'emplois
- Offres d'emploi vedettes
- Top entreprises qui recrutent
- Sections CTA pour candidats et employeurs

### 2. Signup (`/signup`)
- Formulaire d'inscription complet
- Validation des champs
- Sélection du type d'utilisateur (Employers/Candidates)
- Intégration avec l'API backend
- Messages d'erreur et de succès

## 🔌 Configuration Backend

Le frontend se connecte au backend sur **http://localhost:3000**

Pour modifier l'URL du backend, éditer le fichier `src/api/api.ts` :

```typescript
const API_URL = "http://localhost:3000";
```

## 🎨 Personnalisation

### Tailwind CSS
La configuration Tailwind se trouve dans :
- `tailwind.config.js` (configuration principale)
- `src/tailwind.config.js` (configuration locale)

### Couleurs principales
- Primaire : Bleu (#0066FF / blue-600)
- Secondaire : Gris (#6B7280 / gray-500)
- Arrière-plan : Blanc (#FFFFFF)

## 📝 Scripts disponibles

```json
{
  "dev": "vite",              // Démarrer le serveur de développement
  "build": "tsc -b && vite build",  // Build de production
  "lint": "eslint .",         // Linter le code
  "preview": "vite preview"   // Prévisualiser le build
}
```

## 🔧 Configuration TypeScript

Le projet utilise TypeScript avec une configuration stricte :
- `tsconfig.json` - Configuration racine
- `tsconfig.app.json` - Configuration pour le code source
- `tsconfig.node.json` - Configuration pour Vite

## 🌐 Routes API utilisées

### Health Check
```typescript
GET /api/health
Response: { status: "OK", message: "...", database: "..." }
```

### Liste des offres
```typescript
GET /api/offers
Response: Offer[]
```

### Inscription
```typescript
POST /api/auth/signup
Body: { last_name, first_name, email, password, role }
Response: { userId, message }
```

## 🐛 Debugging

### Le backend ne se connecte pas
1. Vérifiez que le backend est démarré sur le port 3000
2. Vérifiez la console du navigateur pour les erreurs CORS
3. Assurez-vous que CORS est activé dans le backend

### Erreurs de build
```bash
# Nettoyer le cache et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### Erreurs TypeScript
```bash
# Vérifier les erreurs TypeScript
npx tsc --noEmit
```

## 📱 Responsive Design

L'application est entièrement responsive :
- Mobile first approach
- Breakpoints Tailwind : `sm:`, `md:`, `lg:`, `xl:`
- Navigation adaptative

## 🚢 Déploiement

### Netlify / Vercel
1. Connecter votre repository GitHub
2. Configurer la commande de build : `npm run build`
3. Définir le dossier de sortie : `dist`

### Variables d'environnement
Créer un fichier `.env` si nécessaire :
```env
VITE_API_URL=http://localhost:3000
```

Accéder aux variables :
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## 🎓 Ressources

- [Documentation React](https://react.dev/)
- [Documentation Vite](https://vitejs.dev/)
- [Documentation Tailwind CSS](https://tailwindcss.com/)
- [Documentation TypeScript](https://www.typescriptlang.org/)
- [Lucide Icons](https://lucide.dev/)

## 👥 Contributeurs

- Développement Frontend : Votre équipe
- Design : RecruPlus Design System

## 📄 Licence

Projet privé - Tous droits réservés

