# 🚀 Guide d'Hébergement - Recruitments Platform

Ce guide vous explique comment héberger votre plateforme de recrutement en production.

## 📋 Options d'Hébergement Recommandées

### Option 1 : Vercel (Frontend) + Railway (Backend + MySQL) ⭐ RECOMMANDÉ

**Avantages :**
- ✅ Gratuit pour commencer
- ✅ Déploiement automatique depuis GitHub
- ✅ SSL/HTTPS automatique
- ✅ Configuration simple

---

## 🎨 ÉTAPE 1 : Héberger le Frontend sur Vercel

### 1.1 Préparer le projet

Le frontend est déjà configuré avec :
- ✅ Variable d'environnement `VITE_API_URL` dans `api.ts`
- ✅ Fichier `vercel.json` pour la configuration

### 1.2 Déployer sur Vercel

1. **Créer un compte Vercel** : https://vercel.com
2. **Connecter votre GitHub** et importer le repo `WhoisDhiya/Recruitments`
3. **Configurer le projet** :
   - **Root Directory** : `Frontend`
   - **Framework Preset** : Vite
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
   - **Install Command** : `npm install`

4. **Ajouter les variables d'environnement** :
   ```
   VITE_API_URL=https://votre-backend-url.railway.app
   ```
   ⚠️ **Note** : Vous ajouterez cette variable APRÈS avoir déployé le backend (étape suivante)

5. **Déployer** : Cliquez sur "Deploy"

6. **Récupérer l'URL du frontend** : Exemple `https://recruitments.vercel.app`

---

## 🔧 ÉTAPE 2 : Héberger le Backend + MySQL sur Railway

### 2.1 Créer un compte Railway

1. Allez sur https://railway.app
2. Créez un compte avec GitHub
3. Cliquez sur "New Project" → "Deploy from GitHub repo"
4. Sélectionnez votre repo `WhoisDhiya/Recruitments`

### 2.2 Ajouter MySQL

1. Dans votre projet Railway, cliquez sur **"+ New"**
2. Sélectionnez **"Database"** → **"Add MySQL"**
3. Railway créera automatiquement une base de données MySQL
4. **Notez les informations de connexion** (affichées dans les variables d'environnement)

### 2.3 Déployer le Backend

1. Dans votre projet Railway, cliquez sur **"+ New"** → **"GitHub Repo"**
2. Sélectionnez votre repo
3. Railway détectera automatiquement le dossier `Backend`
4. Si ce n'est pas le cas, configurez :
   - **Root Directory** : `Backend`
   - **Start Command** : `node index.js`

### 2.4 Configurer les variables d'environnement

Dans les **Settings** du service backend, ajoutez ces variables :

```env
# Base de données (récupérées depuis le service MySQL Railway)
DB_HOST=${{MySQL.MYSQLHOST}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
DB_PORT=${{MySQL.MYSQLPORT}}

# Serveur
PORT=3000
NODE_ENV=production

# JWT
JWT_SECRET=votre_secret_jwt_tres_securise_changez_moi

# Frontend URL (remplacez par votre URL Vercel)
CLIENT_URL=https://votre-frontend.vercel.app

# Stripe (optionnel - laissez vide si vous n'utilisez pas Stripe)
STRIPE_SECRET_KEY=sk_live_... (ou sk_test_... pour les tests)
```

### 2.5 Initialiser la base de données

1. **Option A : Via Railway CLI**
   ```bash
   # Installer Railway CLI
   npm i -g @railway/cli
   
   # Se connecter
   railway login
   
   # Se connecter à la base de données
   railway connect
   
   # Exécuter le script SQL
   mysql -u $MYSQLUSER -p$MYSQLPASSWORD -h $MYSQLHOST $MYSQLDATABASE < Backend/database/schema.sql
   ```

2. **Option B : Via MySQL Workbench ou un client MySQL**
   - Utilisez les credentials MySQL de Railway
   - Connectez-vous à la base de données
   - Exécutez le contenu de `Backend/database/schema.sql`

### 2.6 Récupérer l'URL du backend

1. Dans Railway, allez dans les **Settings** de votre service backend
2. Activez **"Generate Domain"** pour obtenir une URL publique
3. Exemple : `https://recruitment-backend-production.up.railway.app`

---

## 🔄 ÉTAPE 3 : Mettre à jour les URLs

### 3.1 Mettre à jour le Frontend (Vercel)

1. Retournez sur Vercel
2. Allez dans **Settings** → **Environment Variables**
3. Mettez à jour :
   ```
   VITE_API_URL=https://votre-backend-url.railway.app
   ```
4. **Redéployez** le frontend (Vercel le fera automatiquement)

### 3.2 Mettre à jour le Backend (Railway)

1. Retournez sur Railway
2. Mettez à jour la variable `CLIENT_URL` :
   ```
   CLIENT_URL=https://votre-frontend.vercel.app
   ```
3. Railway redéploiera automatiquement

---

## ✅ ÉTAPE 4 : Vérifier le déploiement

### 4.1 Tester le Backend

```bash
# Health check
curl https://votre-backend.railway.app/api/health

# Devrait retourner :
# {"status":"OK","message":"La base de données est connectée",...}
```

### 4.2 Tester le Frontend

1. Ouvrez votre URL Vercel dans le navigateur
2. Vérifiez que l'application se charge
3. Testez la connexion (login/signup)
4. Vérifiez que les requêtes API fonctionnent (ouvrez la console du navigateur)

---

## 🔐 ÉTAPE 5 : Configuration Stripe (Optionnel)

Si vous utilisez Stripe pour les paiements :

1. Créez un compte Stripe : https://stripe.com
2. Récupérez votre **Secret Key** (mode test ou production)
3. Ajoutez-la dans Railway :
   ```
   STRIPE_SECRET_KEY=sk_test_... (ou sk_live_...)
   ```

---

## 🐛 Dépannage

### Erreur CORS
- Vérifiez que `CLIENT_URL` dans Railway correspond exactement à l'URL Vercel
- Vérifiez qu'il n'y a pas de `/` à la fin des URLs

### Erreur de connexion à la base de données
- Vérifiez que toutes les variables MySQL sont correctement configurées
- Vérifiez que la base de données est bien initialisée avec `schema.sql`

### Frontend ne peut pas se connecter au backend
- Vérifiez que `VITE_API_URL` dans Vercel est correcte
- Vérifiez que le backend est bien déployé et accessible
- Vérifiez les logs Railway pour les erreurs

### Voir les logs
- **Vercel** : Onglet "Deployments" → Cliquez sur un déploiement → "View Function Logs"
- **Railway** : Onglet "Deployments" → Cliquez sur un déploiement → "View Logs"

---

## 📊 Alternative : Render.com

Si vous préférez Render au lieu de Railway :

### Backend sur Render

1. Créez un compte sur https://render.com
2. **New** → **Web Service** → Connectez votre repo GitHub
3. Configuration :
   - **Name** : `recruitment-backend`
   - **Root Directory** : `Backend`
   - **Environment** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `node index.js`

4. **New** → **PostgreSQL** (ou MySQL si disponible)
   - Render propose PostgreSQL par défaut, mais vous pouvez utiliser MySQL
   - Notez les credentials

5. Ajoutez les variables d'environnement (comme pour Railway)

---

## 🎉 Félicitations !

Votre plateforme est maintenant en ligne ! 🚀

**URLs de production :**
- Frontend : `https://votre-frontend.vercel.app`
- Backend : `https://votre-backend.railway.app`
- API Health : `https://votre-backend.railway.app/api/health`

---

## 📝 Notes importantes

1. **Sécurité** :
   - Ne commitez JAMAIS les fichiers `.env`
   - Utilisez des secrets forts pour `JWT_SECRET`
   - Activez le mode production pour Stripe quand vous êtes prêt

2. **Backups** :
   - Configurez des backups automatiques de votre base de données MySQL
   - Railway et Render proposent des backups automatiques

3. **Monitoring** :
   - Surveillez les logs régulièrement
   - Configurez des alertes pour les erreurs

4. **Scaling** :
   - Les plans gratuits ont des limites
   - Passez à un plan payant si vous avez beaucoup de trafic

---

## 🆘 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans Railway/Vercel
2. Testez l'API avec Postman ou curl
3. Vérifiez que toutes les variables d'environnement sont correctes
4. Consultez la documentation de Railway et Vercel

**Bonne chance avec votre plateforme ! 🎊**

