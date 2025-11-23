# 🚀 Guide d'installation complète - JobsPlatform Backend

## ✅ **État actuel**

- ✅ Code Backend sans erreurs
- ✅ Dépendances npm installées (192 packages)
- ✅ Fichier `.env` créé
- ⚠️ **MySQL non configuré** (dernière étape)

---

## 📋 **Étapes d'installation MySQL**

### **Étape 1: Vérifier si MySQL est installé**

```powershell
Get-Service -Name MySQL* | Select-Object Name, Status
```

**Si MySQL n'est pas installé:**
1. Téléchargez MySQL : https://dev.mysql.com/downloads/installer/
2. Installez MySQL Server (choisissez la version "MySQL Community Server")
3. Notez le mot de passe root que vous définissez pendant l'installation

### **Étape 2: Démarrer MySQL**

```powershell
# Démarrer le service MySQL
Start-Service -Name MySQL80  # Ou MySQL57, selon votre version

# Vérifier qu'il est démarré
Get-Service -Name MySQL*
```

### **Étape 3: Configurer le fichier .env**

Ouvrez `Backend/.env` et ajoutez votre mot de passe MySQL :

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=VOTRE_MOT_DE_PASSE_ICI    # ← Ajoutez votre mot de passe MySQL
DB_NAME=recruitment_platform
DB_PORT=3306

PORT=3000
NODE_ENV=development

JWT_SECRET=ma_cle_secrete_ultra_securisee_2024_changez_moi_en_production
```

### **Étape 4: Créer la base de données**

**Option A: Via ligne de commande MySQL**
```bash
# Se connecter à MySQL
mysql -u root -p

# Exécuter le script SQL
source database/schema.sql
# ou
\. database/schema.sql

# Quitter
exit
```

**Option B: Directement depuis le terminal**
```bash
mysql -u root -p < database/schema.sql
```

**Option C: Via MySQL Workbench** (Interface graphique)
1. Ouvrez MySQL Workbench
2. Connectez-vous à votre serveur local
3. File → Run SQL Script
4. Sélectionnez `Backend/database/schema.sql`
5. Exécutez

### **Étape 5: Tester la connexion**

```bash
cd Backend
node test-connection.js
```

**Résultat attendu:**
```
✅ Connexion MySQL réussie!
✅ Base de données: recruitment_platform

📊 Tables dans la base de données:
  ✓ users
  ✓ recruiters
  ✓ candidates
  ✓ admins
  ✓ offers
  ✓ requirements
  ✓ applications
  ✓ notifications
  ✓ payments

✅ Test terminé avec succès!
```

---

## 🚀 **Démarrer l'application**

### **Backend (Terminal 1)**
```bash
cd Backend
node index.js
```

**Résultat attendu:**
```
╔════════════════════════════════════════════════════════════╗
║   🚀 Serveur démarré avec succès!                          ║
║   📍 URL: http://localhost:3000                           ║
║   💾 Base de données: recruitment_platform                ║
╚════════════════════════════════════════════════════════════╝
```

### **Frontend (Terminal 2)**
```bash
cd Frontend
npm run dev
```

**Résultat attendu:**
```
VITE vX.X.X  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🐛 **Dépannage**

### **Erreur: "Access denied for user 'root'@'localhost'"**
- ✅ **Solution**: Ajoutez le mot de passe MySQL dans `.env` (DB_PASSWORD)

### **Erreur: "Can't connect to MySQL server"**
- ✅ **Solution**: Démarrez MySQL avec `Start-Service -Name MySQL80`

### **Erreur: "Unknown database 'recruitment_platform'"**
- ✅ **Solution**: Exécutez le script SQL: `mysql -u root -p < database/schema.sql`

### **Erreur: "Port 3000 already in use"**
```powershell
# Trouver et arrêter le processus
netstat -ano | Select-String ":3000"
Stop-Process -Id <PID>  # Remplacez <PID> par l'ID du processus
```

---

## 📝 **Structure de la base de données**

```
users (Table principale)
├── recruiters (Recruteurs)
│   ├── offers (Offres d'emploi)
│   │   └── requirements (Exigences des offres)
│   └── payments (Paiements)
│
├── candidates (Candidats)
│   └── applications (Candidatures)
│
├── admins (Administrateurs)
│
└── notifications (Notifications pour tous)
```

---

## ✅ **Checklist finale**

- [ ] MySQL installé et démarré
- [ ] Mot de passe MySQL ajouté dans `.env`
- [ ] Base de données créée (`mysql -u root -p < database/schema.sql`)
- [ ] Test de connexion réussi (`node test-connection.js`)
- [ ] Backend démarré (`node index.js`)
- [ ] Frontend démarré (`npm run dev`)
- [ ] Navigateur ouvert sur http://localhost:5173

---

## 🎉 **Une fois tout configuré**

Votre application sera accessible :
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

**Test de l'API:**
```bash
# Test health check
curl http://localhost:3000/api/health

# Test signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "last_name": "Test",
    "first_name": "User",
    "email": "test@example.com",
    "password": "password123",
    "role": "candidate"
  }'
```

---

## 📧 **Support**

Si vous rencontrez des problèmes, vérifiez :
1. Les logs du serveur backend dans le terminal
2. La console du navigateur (F12) pour les erreurs frontend
3. Que MySQL est bien démarré
4. Que le fichier `.env` contient le bon mot de passe

**Bonne chance ! 🚀**

