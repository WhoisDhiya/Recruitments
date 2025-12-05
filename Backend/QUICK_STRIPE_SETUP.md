# ⚡ Configuration Rapide de Stripe

## 🎯 Problème Actuel
Vous voyez le message : **"Les paiements ne sont pas activés. Payments are disabled."**

Cela signifie que la clé API Stripe n'est pas configurée dans votre fichier `.env`.

---

## ✅ Solution Rapide (5 minutes)

### Étape 1 : Créer un compte Stripe (si vous n'en avez pas)

1. Allez sur [https://stripe.com](https://stripe.com)
2. Cliquez sur **"Sign up"** (Inscription)
3. Remplissez le formulaire (c'est gratuit)
4. Vérifiez votre email

### Étape 2 : Obtenir votre clé API Stripe

1. Connectez-vous à votre compte Stripe : [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. **Assurez-vous d'être en mode "Test"** (bascule en haut à droite du dashboard)
3. Cliquez sur **"Developers"** dans le menu de gauche
4. Cliquez sur **"API keys"**
5. Vous verrez deux clés :
   - **Publishable key** (commence par `pk_test_...`) - pour le frontend (optionnel pour l'instant)
   - **Secret key** (commence par `sk_test_...`) - **C'EST CELLE-CI QU'IL VOUS FAUT** ⚠️

6. Cliquez sur **"Reveal test key"** à côté de "Secret key"
7. **Copiez la clé** (elle commence par `sk_test_...`)

### Étape 3 : Créer/Modifier le fichier `.env`

1. Allez dans le dossier `Backend` de votre projet
2. Créez un fichier nommé `.env` (s'il n'existe pas déjà)
3. Ajoutez ou modifiez ces lignes :

```env
# Configuration de la base de données (si pas déjà présent)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=recruitment_platform

# Configuration du serveur (si pas déjà présent)
PORT=3000
NODE_ENV=development

# JWT Secret (si pas déjà présent)
JWT_SECRET=votre_secret_key_super_secure

# URL du frontend
CLIENT_URL=http://localhost:5173

# ⭐ CONFIGURATION STRIPE (AJOUTEZ CES LIGNES)
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete_ici
```

**Important** : Remplacez `sk_test_votre_cle_secrete_ici` par la vraie clé que vous avez copiée depuis Stripe.

### Étape 4 : Redémarrer le serveur backend

1. Arrêtez le serveur backend (Ctrl+C dans le terminal)
2. Redémarrez-le :

```bash
cd Backend
npm run dev
```

3. **Vérifiez les logs** : Vous devriez voir :
   ```
   ✅ Payments enabled: Stripe initialized
   ```

Si vous voyez toujours `Payments disabled: STRIPE_SECRET_KEY is not set`, vérifiez que :
- Le fichier `.env` est bien dans le dossier `Backend`
- La variable `STRIPE_SECRET_KEY` est bien écrite (sans espaces avant/après)
- Vous avez bien redémarré le serveur

---

## 🧪 Tester les Paiements

Une fois configuré, vous pouvez tester avec des **cartes de test Stripe** :

### Cartes de test valides :

- **Carte réussie** : `4242 4242 4242 4242`
- **Carte refusée** : `4000 0000 0000 0002`
- **Carte nécessitant 3D Secure** : `4000 0025 0000 3155`

**Pour toutes ces cartes** :
- Date d'expiration : N'importe quelle date future (ex: `12/25`)
- CVC : N'importe quel 3 chiffres (ex: `123`)
- Code postal : N'importe quel code postal valide (ex: `12345`)

---

## 🔍 Vérification

Pour vérifier que tout fonctionne :

1. Redémarrez le serveur backend
2. Regardez les logs au démarrage
3. Essayez de créer un compte recruteur et sélectionner un pack
4. Vous devriez être redirigé vers la page de paiement Stripe

---

## ❌ Problèmes Courants

### "Payments disabled: STRIPE_SECRET_KEY is not set"

**Solution** :
- Vérifiez que le fichier `.env` existe dans le dossier `Backend`
- Vérifiez que la ligne `STRIPE_SECRET_KEY=sk_test_...` est présente
- Vérifiez qu'il n'y a pas d'espaces avant/après le `=`
- Redémarrez le serveur

### "Stripe not initialized"

**Solution** :
- Vérifiez que votre clé commence bien par `sk_test_` (mode test)
- Vérifiez qu'il n'y a pas d'espaces dans la clé
- Vérifiez que vous avez bien installé le package : `npm install` dans le dossier Backend

### Le paiement ne fonctionne toujours pas

**Solution** :
- Vérifiez les logs du serveur backend pour voir les erreurs
- Assurez-vous d'utiliser une carte de test Stripe
- Vérifiez que les URLs de redirection sont correctes dans `CLIENT_URL`

---

## 📚 Plus d'Informations

Pour plus de détails, consultez : `Backend/STRIPE_SETUP.md`

---

## ✅ Checklist

- [ ] Compte Stripe créé
- [ ] Clé API récupérée (sk_test_...)
- [ ] Fichier `.env` créé/modifié dans le dossier `Backend`
- [ ] Variable `STRIPE_SECRET_KEY` ajoutée
- [ ] Serveur backend redémarré
- [ ] Message "Payments enabled" visible dans les logs
- [ ] Test de paiement effectué avec une carte de test

Une fois toutes ces étapes complétées, les paiements devraient fonctionner ! 🎉

