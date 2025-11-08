# Script PowerShell pour configurer MongoDB Atlas
# Usage: .\configure-atlas.ps1

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "      CONFIGURATION MONGODB ATLAS - CodeGenesis" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "D'après MongoDB Atlas:" -ForegroundColor Yellow
Write-Host "  Cluster: cluster0.whxj5zj.mongodb.net" -ForegroundColor White
Write-Host "  Utilisateur: discord" -ForegroundColor White
Write-Host ""

# Demander le mot de passe
$password = Read-Host "Entrez le mot de passe pour l'utilisateur 'discord'"

if ([string]::IsNullOrWhiteSpace($password)) {
    Write-Host "❌ Mot de passe requis" -ForegroundColor Red
    exit 1
}

# Construire l'URI
$mongoURI = "mongodb+srv://discord:$password@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0"

# Chemin du fichier .env
$envPath = Join-Path $PSScriptRoot "backend\.env"

# Vérifier si le fichier existe
if (-not (Test-Path $envPath)) {
    Write-Host "❌ Fichier .env non trouvé: $envPath" -ForegroundColor Red
    exit 1
}

# Lire le contenu du fichier
$envContent = Get-Content $envPath -Raw

# Remplacer ou ajouter MONGODB_URI
$lines = $envContent -split "`n"
$updated = $false
$newLines = @()

foreach ($line in $lines) {
    if ($line -match "^MONGODB_URI=" -or $line -match "^MONGO_URI=") {
        $newLines += "MONGODB_URI=$mongoURI"
        $updated = $true
    } else {
        $newLines += $line
    }
}

# Si MONGODB_URI n'existe pas, l'ajouter
if (-not $updated) {
    $newLines += "MONGODB_URI=$mongoURI"
}

# Écrire le fichier
try {
    $newLines -join "`n" | Set-Content $envPath -NoNewline
    Write-Host ""
    Write-Host "✅ Fichier .env mis à jour avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "URI MongoDB Atlas configurée:" -ForegroundColor Yellow
    Write-Host "mongodb+srv://discord:***@cluster0.whxj5zj.mongodb.net/codegenesis" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
    Write-Host "1. Vérifiez que Network Access est configuré dans MongoDB Atlas (0.0.0.0/0)" -ForegroundColor White
    Write-Host "2. Exécutez le seed: cd backend && npm run seed:atlas" -ForegroundColor White
    Write-Host "3. Vérifiez vos données dans MongoDB Atlas Data Explorer" -ForegroundColor White
    Write-Host ""
    Write-Host "✅ Configuration terminée!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Erreur écriture fichier .env: $_" -ForegroundColor Red
    exit 1
}

