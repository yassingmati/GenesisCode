# Script de déploiement PowerShell pour Render et Firebase

Write-Host "🚀 Déploiement sur Render et Firebase Hosting" -ForegroundColor Cyan

# 1. Build du frontend
Write-Host "📦 Building frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du build du frontend" -ForegroundColor Red
    exit 1
}
Set-Location ..

# 2. Déploiement Firebase Hosting
Write-Host "🔥 Déploiement sur Firebase Hosting..." -ForegroundColor Yellow
npx firebase-tools deploy --only hosting

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du déploiement Firebase" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Déploiement terminé avec succès!" -ForegroundColor Green
Write-Host "📝 Note: Render déploie automatiquement depuis Git" -ForegroundColor Cyan
