# 📁 Plan d'Organisation du Projet CodeGenesis

## 🎯 **Objectifs d'organisation**
- Structure claire et logique
- Séparation des responsabilités
- Facilité de maintenance
- Évolutivité du projet

## 📊 **Structure actuelle analysée**

### ❌ **Problèmes identifiés :**
1. **Fichiers à la racine** : Trop de fichiers .md et .bat
2. **Doublons** : Plusieurs fichiers similaires
3. **Mélange de types** : Documentation, scripts, et code ensemble
4. **Dossiers vides** : `frontend/src/public/`
5. **Fichiers temporaires** : `Nouveau Document texte.txt`, `h origin main`

## 🏗️ **Nouvelle structure proposée**

```
CodeGenesis/
├── 📁 docs/                          # Documentation
│   ├── 📁 api/                       # Documentation API
│   ├── 📁 guides/                    # Guides utilisateur
│   ├── 📁 reports/                   # Rapports de tests
│   └── 📁 architecture/              # Architecture du projet
├── 📁 scripts/                       # Scripts utilitaires
│   ├── 📁 deployment/                # Scripts de déploiement
│   ├── 📁 maintenance/               # Scripts de maintenance
│   └── 📁 development/               # Scripts de développement
├── 📁 backend/                       # Backend Node.js
│   ├── 📁 src/
│   │   ├── 📁 controllers/           # Contrôleurs API
│   │   ├── 📁 models/               # Modèles de données
│   │   ├── 📁 routes/               # Routes API
│   │   ├── 📁 middlewares/          # Middlewares
│   │   ├── 📁 services/              # Services métier
│   │   ├── 📁 utils/                # Utilitaires
│   │   ├── 📁 config/               # Configuration
│   │   └── 📁 uploads/              # Fichiers uploadés
│   ├── 📁 tests/                     # Tests backend
│   ├── 📁 logs/                      # Logs
│   └── 📁 public/                    # Fichiers statiques
├── 📁 frontend/                      # Frontend React
│   ├── 📁 src/
│   │   ├── 📁 components/           # Composants réutilisables
│   │   │   ├── 📁 ui/               # Composants UI de base
│   │   │   ├── 📁 forms/            # Composants de formulaires
│   │   │   ├── 📁 exercises/        # Composants d'exercices
│   │   │   └── 📁 layout/           # Composants de layout
│   │   ├── 📁 pages/                # Pages de l'application
│   │   │   ├── 📁 auth/             # Pages d'authentification
│   │   │   ├── 📁 dashboard/        # Pages du dashboard
│   │   │   ├── 📁 course/           # Pages de cours
│   │   │   └── 📁 admin/            # Pages d'administration
│   │   ├── 📁 hooks/                # Hooks personnalisés
│   │   ├── 📁 contexts/             # Contextes React
│   │   ├── 📁 services/             # Services API
│   │   ├── 📁 utils/                # Utilitaires
│   │   ├── 📁 assets/               # Assets statiques
│   │   └── 📁 styles/               # Styles globaux
│   └── 📁 public/                   # Fichiers publics
├── 📁 shared/                        # Code partagé
│   ├── 📁 types/                     # Types TypeScript
│   ├── 📁 constants/                # Constantes
│   └── 📁 utils/                    # Utilitaires partagés
├── 📁 deployment/                    # Configuration de déploiement
│   ├── 📁 docker/                   # Configuration Docker
│   ├── 📁 nginx/                    # Configuration Nginx
│   └── 📁 scripts/                  # Scripts de déploiement
└── 📁 tools/                         # Outils de développement
    ├── 📁 scripts/                  # Scripts utilitaires
    ├── 📁 configs/                  # Configurations
    └── 📁 templates/                # Modèles
```

## 🔄 **Plan de migration**

### **Phase 1 : Nettoyage initial**
1. Supprimer les fichiers temporaires
2. Déplacer la documentation
3. Organiser les scripts

### **Phase 2 : Restructuration backend**
1. Réorganiser les dossiers
2. Séparer les tests
3. Optimiser la structure

### **Phase 3 : Restructuration frontend**
1. Réorganiser les composants
2. Séparer les pages
3. Optimiser les assets

### **Phase 4 : Finalisation**
1. Créer la documentation
2. Mettre à jour les imports
3. Tester la nouvelle structure

## 📋 **Actions à effectuer**

### **Fichiers à supprimer :**
- `Nouveau Document texte.txt`
- `h origin main`
- `et --soft HEAD~10`
- `ign (removed pomodoro, profile, tech)`

### **Fichiers à déplacer :**
- Documentation → `docs/`
- Scripts → `scripts/`
- Tests → `tests/`

### **Dossiers à créer :**
- `docs/`
- `scripts/`
- `shared/`
- `deployment/`
- `tools/`

## 🎯 **Bénéfices attendus**

### **Maintenabilité :**
- Structure claire et logique
- Séparation des responsabilités
- Facilité de navigation

### **Évolutivité :**
- Ajout facile de nouvelles fonctionnalités
- Structure modulaire
- Réutilisabilité du code

### **Collaboration :**
- Structure standardisée
- Documentation centralisée
- Scripts organisés

---

## 🚀 **Prêt à commencer l'organisation ?**

Cette structure vous permettra d'avoir un projet bien organisé, maintenable et évolutif !
