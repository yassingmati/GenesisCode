#!/bin/bash
# Script de build pour Render
# Ce script s'assure que les dépendances sont installées dans le bon répertoire

echo "🔨 Building backend for Render..."

# Aller dans le répertoire backend
cd backend || exit 1

# Installer les dépendances
echo "📦 Installing dependencies..."
npm install

# Vérifier que les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo "❌ Error: node_modules not found after installation"
    exit 1
fi

echo "✅ Build complete!"

