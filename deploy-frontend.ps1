# Script PowerShell pour rebuild et redéployer le frontend avec la nouvelle URL du backend

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "      REBUILD ET DÉPLOIEMENT FRONTEND" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Vérifier que .env.production existe
if (-not (Test-Path "frontend\.env.production")) {
    Write-Host "❌ Fichier frontend\.env.production non trouvé!" -ForegroundColor Red
    Write-Host "   Exécutez d'abord: node configure-frontend-backend-url.js" -ForegroundColor Yellow
    exit 1
}

# Afficher la configuration
Write-Host "📋 Configuration actuelle:" -ForegroundColor Green
Get-Content "frontend\.env.production"
Write-Host ""

# Demander confirmation
$confirmation = Read-Host "Continuer avec le rebuild? (y/n)"
if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
    Write-Host "❌ Annulé" -ForegroundColor Red
    exit 1
}

# Rebuild le frontend
Write-Host ""
Write-Host "🔨 Rebuild du frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du build" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build réussi!" -ForegroundColor Green
Write-Host ""

# Redéployer sur Firebase Hosting
Write-Host "🚀 Déploiement sur Firebase Hosting..." -ForegroundColor Yellow
Set-Location ..
firebase deploy --only hosting

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du déploiement" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Déploiement terminé!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. Tester l'authentification: https://codegenesis-platform.web.app"
Write-Host "2. Vérifier la console du navigateur (F12)"
Write-Host ""

