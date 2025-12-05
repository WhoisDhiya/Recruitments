# Scripts d'administration

## Créer un administrateur

Pour créer un compte administrateur dans la base de données, utilisez le script suivant :

```bash
cd Backend
node scripts/create-admin.js
```

### Identifiants par défaut

Après l'exécution du script, vous pourrez vous connecter avec :

- **Email** : `admin@recruitment.com`
- **Mot de passe** : `admin123`

### Personnalisation

Pour changer les identifiants, modifiez les variables dans le fichier `create-admin.js` :

```javascript
const email = 'admin@recruitment.com';
const password = 'admin123';
const firstName = 'Admin';
const lastName = 'User';
```

### Vérification

Le script affichera les informations de l'admin créé et vérifiera que tout est correct.

