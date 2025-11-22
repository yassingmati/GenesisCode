# Script de déploiement PowerShell pour Firebase Hosting et Render

Write-Host "🚀 Démarrage du déploiement..." -ForegroundColor Blue

# 1. Build du frontend
Write-Host "`n📦 Build du frontend..." -ForegroundColor Cyan
Set-Location frontend
npm run build
Set-Location ..

# 2. Déploiement Firebase Hosting
Write-Host "`n🔥 Déploiement sur Firebase Hosting..." -ForegroundColor Cyan
firebase deploy --only hosting

Write-Host "`n✅ Déploiement Firebase Hosting terminé!" -ForegroundColor Green

# 3. Instructions pour Render
Write-Host "`n📋 Pour déployer sur Render:" -ForegroundColor Yellow
Write-Host "   1. Poussez les changements sur Git:" -ForegroundColor White
Write-Host "      git add ." -ForegroundColor Gray
Write-Host "      git commit -m 'Fix: Upload et récupération de vidéos/PDFs'" -ForegroundColor Gray
Write-Host "      git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Render détectera automatiquement les changements et redéploiera" -ForegroundColor White
Write-Host "      ou allez sur https://dashboard.render.com et cliquez sur 'Manual Deploy'" -ForegroundColor White

Write-Host "`n✅ Déploiement terminé!" -ForegroundColor Green

