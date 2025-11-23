# Script de lancement automatique - JobsPlatform
# Auteur: Assistant AI
# Description: Lance le Backend et le Frontend en un seul clic

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                           ║" -ForegroundColor Cyan
Write-Host "║          🚀 JobsPlatform - Lancement automatique          ║" -ForegroundColor Cyan
Write-Host "║                                                           ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Fonction pour tester MySQL
function Test-MySQL {
    Write-Host "🔍 Vérification de MySQL..." -ForegroundColor Yellow
    
    $mysqlService = Get-Service -Name MySQL* -ErrorAction SilentlyContinue | Where-Object {$_.Status -eq 'Running'}
    
    if ($mysqlService) {
        Write-Host "✅ MySQL est démarré : $($mysqlService.Name)" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ MySQL n'est pas démarré" -ForegroundColor Red
        Write-Host ""
        Write-Host "📋 Actions nécessaires:" -ForegroundColor Yellow
        Write-Host "  1. Installez MySQL depuis: https://dev.mysql.com/downloads/installer/" -ForegroundColor White
        Write-Host "  2. Démarrez MySQL: Start-Service -Name MySQL80" -ForegroundColor White
        Write-Host "  3. Configurez le mot de passe dans Backend\.env" -ForegroundColor White
        Write-Host "  4. Créez la base de données: mysql -u root -p < Backend\database\schema.sql" -ForegroundColor White
        Write-Host ""
        Write-Host "📄 Consultez Backend\SETUP_GUIDE.md pour plus de détails" -ForegroundColor Cyan
        return $false
    }
}

# Fonction pour tester le fichier .env
function Test-EnvFile {
    Write-Host "🔍 Vérification du fichier .env..." -ForegroundColor Yellow
    
    if (Test-Path "Backend\.env") {
        $envContent = Get-Content "Backend\.env" -Raw
        
        if ($envContent -match "DB_PASSWORD=\s*$" -or $envContent -match "DB_PASSWORD=$") {
            Write-Host "⚠️  Le mot de passe MySQL n'est pas configuré dans Backend\.env" -ForegroundColor Yellow
            Write-Host "   Ouvrez Backend\.env et ajoutez votre mot de passe MySQL" -ForegroundColor White
            return $false
        } else {
            Write-Host "✅ Fichier .env configuré" -ForegroundColor Green
            return $true
        }
    } else {
        Write-Host "❌ Fichier Backend\.env manquant" -ForegroundColor Red
        return $false
    }
}

# Vérifications préalables
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "  ÉTAPE 1: Vérifications préalables" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

$mysqlOK = Test-MySQL
$envOK = Test-EnvFile

if (-not $mysqlOK -or -not $envOK) {
    Write-Host ""
    Write-Host "❌ Configuration incomplète. Veuillez suivre les instructions ci-dessus." -ForegroundColor Red
    Write-Host ""
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

Write-Host ""

# Test de connexion à la base de données
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "  ÉTAPE 2: Test de connexion à la base de données" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

Push-Location Backend
$testResult = node test-connection.js 2>&1
Pop-Location

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Erreur de connexion à la base de données" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Solutions possibles:" -ForegroundColor Yellow
    Write-Host "  1. Vérifiez le mot de passe dans Backend\.env" -ForegroundColor White
    Write-Host "  2. Créez la base de données: mysql -u root -p < Backend\database\schema.sql" -ForegroundColor White
    Write-Host "  3. Consultez Backend\SETUP_GUIDE.md" -ForegroundColor White
    Write-Host ""
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

Write-Host ""

# Lancement du Backend
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "  ÉTAPE 3: Lancement du Backend" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

Write-Host "🚀 Démarrage du Backend sur http://localhost:3000..." -ForegroundColor Yellow

# Lancer le backend dans une nouvelle fenêtre PowerShell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\Backend'; node index.js" -WindowStyle Normal

Write-Host "✅ Backend lancé dans une nouvelle fenêtre" -ForegroundColor Green
Start-Sleep -Seconds 3

Write-Host ""

# Lancement du Frontend
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "  ÉTAPE 4: Lancement du Frontend" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

Write-Host "🚀 Démarrage du Frontend sur http://localhost:5173..." -ForegroundColor Yellow

# Lancer le frontend dans une nouvelle fenêtre PowerShell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\Frontend'; npm run dev" -WindowStyle Normal

Write-Host "✅ Frontend lancé dans une nouvelle fenêtre" -ForegroundColor Green
Start-Sleep -Seconds 3

Write-Host ""

# Résumé
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "  ✅ LANCEMENT RÉUSSI" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
Write-Host "🌐 Application accessible sur:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Frontend:  http://localhost:5173" -ForegroundColor Green
Write-Host "   Backend:   http://localhost:3000" -ForegroundColor Green
Write-Host "   Health:    http://localhost:3000/api/health" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Le Backend et le Frontend s'exécutent dans des fenêtres séparées" -ForegroundColor Yellow
Write-Host "   Fermez ces fenêtres pour arrêter les serveurs" -ForegroundColor Yellow
Write-Host ""
Write-Host "🎉 Bon développement !" -ForegroundColor Cyan
Write-Host ""

Read-Host "Appuyez sur Entrée pour quitter"

