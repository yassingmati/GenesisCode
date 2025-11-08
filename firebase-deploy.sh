#!/bin/bash

# Script de déploiement Firebase pour CodeGenesis
# Usage: ./firebase-deploy.sh [hosting|functions|all]

set -e

echo "🚀 Déploiement Firebase CodeGenesis"
echo "===================================="

# Vérifier que Firebase CLI est installé
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI n'est pas installé"
    echo "Installez-le avec: npm install -g firebase-tools"
    exit 1
fi

# Vérifier que l'utilisateur est connecté
if ! firebase projects:list &> /dev/null; then
    echo "❌ Vous n'êtes pas connecté à Firebase"
    echo "Connectez-vous avec: firebase login"
    exit 1
fi

DEPLOY_TARGET=${1:-all}

case $DEPLOY_TARGET in
    hosting)
        echo "📦 Construction du frontend..."
        cd frontend
        npm install
        npm run build
        cd ..
        
        echo "🚀 Déploiement du frontend..."
        firebase deploy --only hosting
        ;;
    functions)
        echo "🚀 Déploiement des functions..."
        firebase deploy --only functions
        ;;
    all)
        echo "📦 Construction du frontend..."
        cd frontend
        npm install
        npm run build
        cd ..
        
        echo "🚀 Déploiement complet..."
        firebase deploy
        ;;
    *)
        echo "❌ Option invalide: $DEPLOY_TARGET"
        echo "Usage: ./firebase-deploy.sh [hosting|functions|all]"
        exit 1
        ;;
esac

echo "✅ Déploiement terminé!"

