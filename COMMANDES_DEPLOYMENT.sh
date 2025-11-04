#!/bin/bash

# Script pour faciliter le déploiement sur GitHub Pages
# Usage: ./COMMANDES_DEPLOYMENT.sh

echo "🚀 Script de Déploiement GitHub Pages - CodeGenesis"
echo "=================================================="
echo ""

# Vérifier si Git est initialisé
if [ ! -d ".git" ]; then
    echo "📦 Initialisation de Git..."
    git init
fi

# Demander le username GitHub
read -p "Entrez votre username GitHub: " GITHUB_USERNAME
read -p "Entrez le nom de votre repository GitHub: " REPO_NAME

# Construire l'URL du repository
REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
PAGES_URL="https://${GITHUB_USERNAME}.github.io/${REPO_NAME}/"

echo ""
echo "📋 Configuration:"
echo "   Repository: ${REPO_URL}"
echo "   GitHub Pages: ${PAGES_URL}"
echo ""

# Ajouter tous les fichiers
echo "📁 Ajout des fichiers..."
git add .

# Créer le commit initial
echo "💾 Création du commit..."
git commit -m "Initial commit - CodeGenesis Platform Ready for GitHub Pages" || echo "⚠️  Pas de nouveaux fichiers à commiter"

# Configurer le remote
echo "🔗 Configuration du remote..."
git remote remove origin 2>/dev/null
git remote add origin "${REPO_URL}"

# Créer la branche main
echo "🌿 Configuration de la branche main..."
git branch -M main

echo ""
echo "✅ Configuration locale terminée!"
echo ""
echo "📝 Prochaines étapes:"
echo ""
echo "1. Créez le repository sur GitHub:"
echo "   → Allez sur https://github.com/new"
echo "   → Nom: ${REPO_NAME}"
echo "   → Créez le repository (sans README)"
echo ""
echo "2. Poussez le code:"
echo "   git push -u origin main"
echo ""
echo "3. Activez GitHub Pages:"
echo "   → Settings → Pages → Source: GitHub Actions"
echo ""
echo "4. Configurez les secrets:"
echo "   → Settings → Secrets and variables → Actions"
echo "   → Ajoutez REACT_APP_API_BASE_URL et REACT_APP_API_URL"
echo ""
echo "5. Votre lien GitHub Pages sera:"
echo "   ${PAGES_URL}"
echo ""
echo "🎉 Une fois le déploiement terminé, votre site sera accessible à cette URL!"

