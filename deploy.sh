#!/bin/bash
# Script de déploiement pour Firebase Hosting et Render

set -e

echo "🚀 Démarrage du déploiement..."

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Build du frontend
echo -e "${BLUE}📦 Build du frontend...${NC}"
cd frontend
npm run build
cd ..

# 2. Déploiement Firebase Hosting
echo -e "${BLUE}🔥 Déploiement sur Firebase Hosting...${NC}"
firebase deploy --only hosting

echo -e "${GREEN}✅ Déploiement Firebase Hosting terminé!${NC}"

# 3. Instructions pour Render
echo -e "${YELLOW}📋 Pour déployer sur Render:${NC}"
echo "   1. Poussez les changements sur Git:"
echo "      git add ."
echo "      git commit -m 'Fix: Upload et récupération de vidéos/PDFs'"
echo "      git push origin main"
echo ""
echo "   2. Render détectera automatiquement les changements et redéploiera"
echo "      ou allez sur https://dashboard.render.com et cliquez sur 'Manual Deploy'"

echo -e "${GREEN}✅ Déploiement terminé!${NC}"

