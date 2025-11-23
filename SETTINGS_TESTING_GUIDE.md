# 🧪 SETTINGS PAGE - TESTING GUIDE

## 🎯 Tests Manuels

### Test 1: Accès à Settings depuis Dashboard

**Étapes:**
1. Ouvrir l'application dans le navigateur
2. Se connecter avec un compte candidat
3. Atterrir sur le Dashboard
4. Dans la sidebar gauche, cliquer sur "⚙️ Settings"

**Résultat attendu:**
- ✅ Navigation vers `/settings`
- ✅ Affichage de la page Settings
- ✅ 4 onglets visibles: Personal, Profile, Social, Account

---

### Test 2: Accès à Settings depuis RecruiterDashboard

**Étapes:**
1. Se connecter avec un compte recruteur
2. Atterrir sur RecruiterDashboard
3. Dans la sidebar, cliquer sur "⚙️ Settings"

**Résultat attendu:**
- ✅ Navigation vers `/settings`
- ✅ Affichage de la page Settings

---

### Test 3: Accès à Settings depuis AdminDashboard

**Étapes:**
1. Se connecter avec un compte admin
2. Atterrir sur AdminDashboard
3. Dans la sidebar gauche, cliquer sur "⚙️ Settings"

**Résultat attendu:**
- ✅ Navigation vers `/settings`
- ✅ Affichage de la page Settings

---

### Test 4: Navigation entre les onglets

**Étapes:**
1. Être sur la page Settings
2. Cliquer sur l'onglet "Profile"
3. Cliquer sur l'onglet "Social"
4. Cliquer sur l'onglet "Account"
5. Retour à "Personal"

**Résultat attendu:**
- ✅ Les onglets changent correctement
- ✅ L'onglet actif est surligné en bleu
- ✅ Animation smooth entre les onglets
- ✅ Les données sont conservées lors du changement

---

### Test 5: Édition Personal Information

**Étapes:**
1. Être sur l'onglet "Personal"
2. Modifier les champs (First Name, Email, etc.)
3. Cliquer sur "Save Changes"

**Résultat attendu:**
- ✅ Les champs acceptent les inputs
- ✅ Le bouton "Save Changes" fonctionne
- ✅ Un message vert s'affiche: "✓ Changes saved successfully"
- ✅ Le message disparaît après 3 secondes

---

### Test 6: Édition Profile Information

**Étapes:**
1. Aller à l'onglet "Profile"
2. Modifier l'adresse, la ville, etc.
3. Entrer du texte dans la bio
4. Cliquer "Save Changes"

**Résultat attendu:**
- ✅ Les champs acceptent les inputs
- ✅ La textarea Bio fonctionne
- ✅ Le bouton "Save Changes" fonctionne
- ✅ Message de confirmation affichée

---

### Test 7: Upload Photo de Profil

**Étapes:**
1. Aller à l'onglet "Profile"
2. Cliquer sur "Upload Photo"
3. Sélectionner une image (JPG, PNG, etc.)

**Résultat attendu:**
- ✅ Dialogue de sélection de fichier s'ouvre
- ✅ Possibilité de sélectionner une image
- ✅ Bouton "Upload Photo" reste visible

---

### Test 8: Édition Social Links

**Étapes:**
1. Aller à l'onglet "Social"
2. Entrer des URLs valides:
   - LinkedIn: https://linkedin.com/in/test
   - Twitter: https://twitter.com/test
   - Facebook: https://facebook.com/test
   - Instagram: https://instagram.com/test
   - Portfolio: https://example.com
3. Cliquer "Save Changes"

**Résultat attendu:**
- ✅ Les URLs sont acceptées
- ✅ Les icônes de réseaux sont colorées
- ✅ Message de confirmation affiché

---

### Test 9: Change Password

**Étapes:**
1. Aller à l'onglet "Account Settings"
2. Entrer le mot de passe actuel
3. Entrer un nouveau mot de passe
4. Confirmer le nouveau mot de passe
5. Cliquer "Save Changes"

**Résultat attendu:**
- ✅ Les champs acceptent les inputs
- ✅ Les icônes Eye permettent d'afficher/masquer
- ✅ Validation des champs fonctionne
- ✅ Message de confirmation

---

### Test 10: Toggle Password Visibility

**Étapes:**
1. Être sur l'onglet "Account Settings"
2. Cliquer sur l'icône Eye pour "Current Password"
3. Observer le changement
4. Cliquer à nouveau pour masquer

**Résultat attendu:**
- ✅ L'icône Eye est visible et cliquable
- ✅ Le texte du mot de passe change de visible à masqué
- ✅ L'icône change (Eye ↔ EyeOff)

---

### Test 11: Notification Preferences

**Étapes:**
1. Être sur l'onglet "Account Settings"
2. Décocher "Email Notifications"
3. Cocher "SMS Notifications"
4. Cliquer "Save Changes"

**Résultat attendu:**
- ✅ Les checkboxes se cochent/décochent
- ✅ Les descriptions sont visibles
- ✅ Le bouton Save fonctionne

---

### Test 12: Responsive Design Mobile

**Étapes:**
1. Ouvrir DevTools (F12)
2. Activer le mode mobile (Ctrl+Shift+M)
3. Sélectionner un téléphone (iPhone 12, Pixel 5, etc.)
4. Naviguer sur la page Settings
5. Tester tous les onglets

**Résultat attendu:**
- ✅ La layout s'adapte au mobile
- ✅ Les onglets restent visibles
- ✅ Les formulaires sont utilisables
- ✅ Pas de débordement horizontal
- ✅ Les boutons sont cliquables

---

### Test 13: Responsive Design Tablet

**Étapes:**
1. DevTools → Mode mobile
2. Sélectionner une tablette (iPad, etc.)
3. Naviguer la page

**Résultat attendu:**
- ✅ L'interface s'affiche correctement
- ✅ 2 colonnes de formulaires si possible
- ✅ Utilisation optimale de l'espace

---

### Test 14: Retour Depuis Settings

**Étapes:**
1. Aller à Settings
2. Cliquer sur le bouton back du navigateur

**Résultat attendu:**
- ✅ Retour au dashboard précédent
- ✅ L'URL change correctement

---

### Test 15: Authentification Non Requise

**Étapes:**
1. Être déconnecté
2. Entrer directement l'URL `/settings`
3. Appuyer sur Entrée

**Résultat attendu:**
- ✅ Redirection automatique vers `/signin`
- ✅ Impossible d'accéder à Settings sans authentification

---

## 📊 Test de Performance

### Test de charge des images

**Étapes:**
1. Upload une image de ~5MB

**Résultat attendu:**
- ✅ L'upload complète sans erreur
- ✅ Message de succès affiché

---

### Test de vitesse

**Étapes:**
1. Ouvrir DevTools → Network tab
2. Naviguer sur Settings
3. Observer les temps de chargement

**Résultat attendu:**
- ✅ CSS charge rapidement (<500ms)
- ✅ Page interactive immédiatement
- ✅ Pas de lag lors du changement d'onglets

---

## 🐛 Test de Bogues Connus

### Test 1: Messages d'Erreur

**Étapes:**
1. Essayer de sauvegarder sans remplir les champs
2. Observer les messages

**Résultat attendu:**
- ✅ Pas d'erreur critique
- ✅ Comportement graceful

---

### Test 2: Validation du Formulaire

**Étapes:**
1. Entrer des données invalides
2. Essayer de sauvegarder

**Résultat attendu:**
- ✅ Pas de crash
- ✅ Comportement prévisible

---

## ✅ Checklist de Test

- [ ] Navigation depuis Dashboard fonctionne
- [ ] Navigation depuis RecruiterDashboard fonctionne
- [ ] Navigation depuis AdminDashboard fonctionne
- [ ] 4 onglets visibles et fonctionnels
- [ ] Personal tab: tous les champs remplissables
- [ ] Profile tab: upload photo fonctionne
- [ ] Social tab: URLs acceptées
- [ ] Account tab: changement de mot de passe fonctionne
- [ ] Eye icon toggle pour les mots de passe
- [ ] Checkboxes pour les notifications
- [ ] Save Changes button fonctionne
- [ ] Message de confirmation s'affiche
- [ ] Message disparaît après 3 secondes
- [ ] Responsive sur mobile
- [ ] Responsive sur tablet
- [ ] Responsive sur desktop
- [ ] Authentification requise
- [ ] Pas d'erreurs console critiques
- [ ] Animations smooth
- [ ] Navigation back fonctionne

---

## 🔧 Debugging Tips

### Si la page ne s'affiche pas
1. Ouvrir la console (F12)
2. Vérifier les erreurs
3. Vérifier que l'URL est `/settings`
4. Vérifier que vous êtes authentifié

### Si les styles ne s'appliquent pas
1. F5 pour rafraîchir
2. Ctrl+Shift+R pour vider le cache
3. Vérifier le fichier Settings.css existe

### Si la navigation ne fonctionne pas
1. Vérifier que `useNavigate()` est importé
2. Vérifier que la route est dans App.tsx
3. Console: Cliquer Settings et regarder les logs

---

## 📱 Navigateurs à Tester

- [ ] Chrome (Recommandé)
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## 📋 Rapport de Test

Après avoir complété tous les tests, créez un rapport:

```markdown
# Settings Page - Test Report

**Date:** [Date]
**Testeur:** [Nom]
**Navigateur:** [Navigateur]
**OS:** [Windows/Mac/Linux]

## Résultats
- ✅ Tous les tests passent
- ❌ Tests échoués: [Lister]
- ⚠️ Problèmes potentiels: [Lister]

## Notes
[Ajouter des notes]
```

---

**Dernière mise à jour:** November 10, 2025
**Version:** 1.0
