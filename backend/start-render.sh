#!/bin/bash
# Script de démarrage pour Render
set -e

echo "🚀 Starting backend for Render..."

# Aller dans le répertoire backend
if [ -d "/opt/render/project/src/backend" ]; then
    cd /opt/render/project/src/backend
elif [ -d "backend" ]; then
    cd backend
else
    echo "❌ Error: backend directory not found!"
    pwd
    ls -la
    exit 1
fi

echo "📁 Current directory: $(pwd)"

# Vérifier que package.json existe
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    exit 1
fi

# Vérifier que package-lock.json existe
if [ ! -f "package-lock.json" ]; then
    echo "⚠️  package-lock.json not found, generating..."
    npm install --package-lock-only
fi

# Installer les dépendances avec npm ci
echo "📦 Installing dependencies with npm ci..."
npm ci --production=false

# Vérifier que cookie-parser est installé
if [ ! -d "node_modules/cookie-parser" ]; then
    echo "❌ Error: cookie-parser not found after installation!"
    echo "📋 Attempting to install cookie-parser directly..."
    npm install cookie-parser --save
    if [ ! -d "node_modules/cookie-parser" ]; then
        echo "❌ Error: Still cannot install cookie-parser!"
        exit 1
    fi
fi

echo "✅ Dependencies installed successfully"

# Vérifier que les modules essentiels peuvent être chargés
echo "🔍 Verifying critical modules..."
node -e "
try {
    require('cookie-parser');
    require('express');
    require('mongoose');
    console.log('✅ All critical modules can be loaded');
} catch(e) {
    console.error('❌ Error loading modules:', e.message);
    process.exit(1);
}
"

# Démarrer le serveur
echo "🚀 Starting server..."
exec npm start

