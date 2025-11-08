#!/bin/bash
# Script de démarrage pour Render
set -e

echo "🚀 Starting backend..."

# Aller dans le répertoire backend (depuis la racine du projet)
if [ -d "backend" ]; then
    cd backend
elif [ -d "/opt/render/project/src/backend" ]; then
    cd /opt/render/project/src/backend
else
    echo "❌ Error: backend directory not found!"
    echo "Current directory: $(pwd)"
    echo "Contents:"
    ls -la
    exit 1
fi

# Afficher le répertoire de travail
echo "📁 Current directory: $(pwd)"
echo "📁 Files in current directory:"
ls -la

# Vérifier que package.json existe
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    exit 1
fi

# Afficher les dépendances
echo "📦 Dependencies in package.json:"
grep -A 20 '"dependencies"' package.json | head -20

# Nettoyer le cache npm
echo "🧹 Cleaning npm cache..."
npm cache clean --force

# Supprimer node_modules s'il existe
if [ -d "node_modules" ]; then
    echo "🗑️  Removing existing node_modules..."
    rm -rf node_modules
fi

# Installer les dépendances
echo "📦 Installing dependencies..."
npm install --production=false

# Vérifier que cookie-parser est installé
if [ ! -d "node_modules/cookie-parser" ]; then
    echo "⚠️  cookie-parser not found, installing directly..."
    npm install cookie-parser --save
fi

# Vérifier l'installation
echo "✅ Verifying installation..."
ls -la node_modules | head -10
if [ -d "node_modules/cookie-parser" ]; then
    echo "✅ cookie-parser is installed"
else
    echo "❌ cookie-parser is still not found!"
    exit 1
fi

# Démarrer le serveur
echo "🚀 Starting server..."
npm start
