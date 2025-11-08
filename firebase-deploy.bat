@echo off
REM Script de déploiement Firebase pour CodeGenesis (Windows)
REM Usage: firebase-deploy.bat [hosting|functions|all]

setlocal enabledelayedexpansion

echo 🚀 Déploiement Firebase CodeGenesis
echo ====================================

REM Vérifier que Firebase CLI est installé
where firebase >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Firebase CLI n'est pas installé
    echo Installez-le avec: npm install -g firebase-tools
    exit /b 1
)

set DEPLOY_TARGET=%1
if "%DEPLOY_TARGET%"=="" set DEPLOY_TARGET=all

if "%DEPLOY_TARGET%"=="hosting" (
    echo 📦 Construction du frontend...
    cd frontend
    call npm install
    call npm run build
    cd ..
    
    echo 🚀 Déploiement du frontend...
    firebase deploy --only hosting
) else if "%DEPLOY_TARGET%"=="functions" (
    echo 🚀 Déploiement des functions...
    firebase deploy --only functions
) else if "%DEPLOY_TARGET%"=="all" (
    echo 📦 Construction du frontend...
    cd frontend
    call npm install
    call npm run build
    cd ..
    
    echo 🚀 Déploiement complet...
    firebase deploy
) else (
    echo ❌ Option invalide: %DEPLOY_TARGET%
    echo Usage: firebase-deploy.bat [hosting^|functions^|all]
    exit /b 1
)

echo ✅ Déploiement terminé!

