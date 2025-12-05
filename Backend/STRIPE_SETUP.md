# Guide de Configuration Stripe pour les Paiements

## 📋 Prérequis

Stripe est déjà inclus dans les dépendances du projet. Vous devez simplement :

1. **Installer les dépendances** (si ce n'est pas déjà fait)
2. **Créer un compte Stripe** (gratuit)
3. **Obtenir vos clés API**
4. **Configurer les variables d'environnement**

---

## 🚀 Étapes d'Installation

### 1. Installer les dépendances Node.js

Ouvrez un terminal dans le dossier `Backend` et exécutez :

```bash
npm install
```

Cela installera automatiquement le package `stripe` (version 20.0.0) qui est déjà dans `package.json`.

### 2. Créer un compte Stripe

1. Allez sur [https://stripe.com](https://stripe.com)
2. Cliquez sur **"Sign up"** (Inscription)
3. Remplissez le formulaire avec vos informations
4. Vérifiez votre email

> **Note** : Stripe propose un mode **Test** (gratuit) et un mode **Production** (avec frais). Pour le développement, utilisez le mode Test.

### 3. Obtenir vos clés API Stripe

Une fois connecté à votre compte Stripe :

1. Allez dans le **Dashboard Stripe** : [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Assurez-vous d'être en mode **"Test"** (bascule en haut à droite)
3. Cliquez sur **"Developers"** dans le menu de gauche
4. Cliquez sur **"API keys"**
5. Vous verrez deux clés :
   - **Publishable key** (commence par `pk_test_...`) - pour le frontend
   - **Secret key** (commence par `sk_test_...`) - pour le backend ⚠️ **NE JAMAIS PARTAGER**

### 4. Configurer le fichier .env

Créez ou modifiez le fichier `.env` à la racine du dossier `Backend` :

```env
# Configuration de la base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=recruitment_platform

# Configuration du serveur
PORT=3000
NODE_ENV=development

# JWT Secret
JWT_SECRET=votre_secret_key_super_secure

# URL du frontend (pour les redirections après paiement)
CLIENT_URL=http://localhost:5173

# Configuration Stripe
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete_ici
STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique_ici
```

**Important** :
- Remplacez `sk_test_votre_cle_secrete_ici` par votre **Secret key** de Stripe
- Remplacez `pk_test_votre_cle_publique_ici` par votre **Publishable key** de Stripe
- Pour la production, utilisez les clés qui commencent par `sk_live_` et `pk_live_`

### 5. Vérifier la configuration

Démarrez le serveur backend :

```bash
npm run dev
```

Vous devriez voir dans la console :
- ✅ `Payments enabled: Stripe initialized` - Si Stripe est bien configuré
- ⚠️ `Payments disabled: STRIPE_SECRET_KEY is not set` - Si la clé n'est pas configurée

---

## 🧪 Tester les Paiements en Mode Test

Stripe fournit des **cartes de test** pour tester les paiements sans utiliser de vraies cartes :

### Cartes de test valides :

- **Carte réussie** : `4242 4242 4242 4242`
- **Carte refusée** : `4000 0000 0000 0002`
- **Carte nécessitant 3D Secure** : `4000 0025 0000 3155`

**Pour toutes ces cartes** :
- Date d'expiration : N'importe quelle date future (ex: `12/25`)
- CVC : N'importe quel 3 chiffres (ex: `123`)
- Code postal : N'importe quel code postal valide (ex: `12345`)

### Tester un paiement :

1. Créez un compte recruteur sur votre site
2. Sélectionnez un pack d'abonnement
3. Utilisez une carte de test Stripe
4. Le paiement devrait être traité avec succès

---

## 🔒 Sécurité

⚠️ **IMPORTANT** :

1. **Ne jamais commiter le fichier `.env`** dans Git
2. **Ne jamais partager vos clés secrètes** (`sk_test_...` ou `sk_live_...`)
3. **Utilisez le mode Test** pour le développement
4. **Passez en mode Production** uniquement quand vous êtes prêt à accepter de vrais paiements

---

## 🐛 Dépannage

### Problème : "Payments disabled: STRIPE_SECRET_KEY is not set"

**Solution** : Vérifiez que :
- Le fichier `.env` existe dans le dossier `Backend`
- La variable `STRIPE_SECRET_KEY` est bien définie
- Vous avez redémarré le serveur après avoir modifié `.env`

### Problème : "Stripe is not configured"

**Solution** : 
- Vérifiez que votre clé secrète commence bien par `sk_test_` (mode test) ou `sk_live_` (mode production)
- Vérifiez qu'il n'y a pas d'espaces avant/après la clé dans le fichier `.env`

### Problème : Erreur lors du paiement

**Solution** :
- Vérifiez que vous utilisez une carte de test valide
- Vérifiez les logs du serveur backend pour plus de détails
- Assurez-vous que les URLs de redirection (`success_url` et `cancel_url`) sont correctes

---

## 📚 Ressources

- [Documentation Stripe](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Dashboard](https://dashboard.stripe.com)

---

## ✅ Checklist de Configuration

- [ ] `npm install` exécuté dans le dossier Backend
- [ ] Compte Stripe créé
- [ ] Clés API récupérées (Test mode)
- [ ] Fichier `.env` créé avec `STRIPE_SECRET_KEY`
- [ ] Serveur backend redémarré
- [ ] Message "Payments enabled" visible dans les logs
- [ ] Test de paiement effectué avec une carte de test

Une fois toutes ces étapes complétées, les paiements devraient fonctionner ! 🎉

