#!/bin/bash
# Script de build pour Render
set -e

echo "🔨 Building backend for Render..."

# Aller dans le répertoire backend
cd backend

# Installer les dépendances avec npm ci (plus fiable)
echo "📦 Installing dependencies with npm ci..."
npm ci --production=false

# Vérifier que les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo "❌ Error: node_modules not found after installation"
    exit 1
fi

# Vérifier que cookie-parser est installé
if [ ! -d "node_modules/cookie-parser" ]; then
    echo "❌ Error: cookie-parser not found in node_modules"
    echo "📋 Attempting to install cookie-parser directly..."
    npm install cookie-parser --save
fi

echo "✅ Build complete!"
echo "📦 Installed packages:"
ls -la node_modules | head -20

