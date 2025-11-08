#!/bin/bash
# Script pour rebuild et redéployer le frontend avec la nouvelle URL du backend

echo "═══════════════════════════════════════════════════════════"
echo "      REBUILD ET DÉPLOIEMENT FRONTEND"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Vérifier que .env.production existe
if [ ! -f "frontend/.env.production" ]; then
    echo "❌ Fichier frontend/.env.production non trouvé!"
    echo "   Exécutez d'abord: node configure-frontend-backend-url.js"
    exit 1
fi

# Afficher la configuration
echo "📋 Configuration actuelle:"
cat frontend/.env.production
echo ""

# Demander confirmation
read -p "Continuer avec le rebuild? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Annulé"
    exit 1
fi

# Rebuild le frontend
echo ""
echo "🔨 Rebuild du frontend..."
cd frontend
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build"
    exit 1
fi

echo "✅ Build réussi!"
echo ""

# Redéployer sur Firebase Hosting
echo "🚀 Déploiement sur Firebase Hosting..."
cd ..
firebase deploy --only hosting

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du déploiement"
    exit 1
fi

echo ""
echo "✅ Déploiement terminé!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Tester l'authentification: https://codegenesis-platform.web.app"
echo "2. Vérifier la console du navigateur (F12)"
echo ""

