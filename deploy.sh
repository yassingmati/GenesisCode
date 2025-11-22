#!/bin/bash
# Script de déploiement pour Render et Firebase

echo "🚀 Déploiement sur Render et Firebase Hosting"

# 1. Build du frontend
echo "📦 Building frontend..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Erreur lors du build du frontend"
  exit 1
fi
cd ..

# 2. Déploiement Firebase Hosting
echo "🔥 Déploiement sur Firebase Hosting..."
npx firebase-tools deploy --only hosting

if [ $? -ne 0 ]; then
  echo "❌ Erreur lors du déploiement Firebase"
  exit 1
fi

echo "✅ Déploiement terminé avec succès!"
echo "📝 Note: Render déploie automatiquement depuis Git"
