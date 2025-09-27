# GenesisCode

## 🚀 Plateforme d'Apprentissage Interactive

GenesisCode est une plateforme d'apprentissage moderne et interactive conçue pour offrir une expérience éducative complète avec des cours, exercices et un système de progression avancé.

## ✨ Fonctionnalités Principales

### 🎨 Pages de Cours
- **DebutantMap** - Carte interactive des cours avec navigation intuitive
- **LevelPage** - Pages de niveau avec support PDF et vidéo
- **ExercisePage** - Exercices interactifs avec feedback en temps réel

### 🔒 Système d'Authentification
- **AuthGuard** - Protection des routes
- **AuthContext** - Support Firebase + Backend API
- **Redirection automatique** vers /login si non connecté

### 🌐 Traduction Multilingue
- **LanguageContext** - Gestion globale des langues
- **useTranslation** - Hook de traduction
- **Support complet** : Français, Anglais, Arabe

### 🚀 Logo GenesisCode
- **Logo cliquable** sur toutes les pages de cours
- **Redirection vers dashboard** au clic
- **Animations et effets visuels**

### 📱 Dashboard Client
- **Interface moderne** et responsive
- **Gestion de profil** utilisateur
- **Tâches quotidiennes** et suivi de progression
- **Statistiques** détaillées

## 🛠️ Technologies Utilisées

### Frontend
- **React** - Framework JavaScript
- **Styled Components** - CSS-in-JS
- **Framer Motion** - Animations
- **React Router DOM** - Navigation
- **Axios** - Requêtes HTTP
- **Firebase Auth** - Authentification

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Mongoose** - ODM MongoDB
- **Multer** - Upload de fichiers
- **JWT** - Authentification

## 📁 Structure du Projet

```
CodeGenesis/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthGuard.jsx
│   │   │   └── LanguageSelector.jsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   └── LanguageContext.jsx
│   │   ├── hooks/
│   │   │   └── useTranslation.js
│   │   ├── pages/
│   │   │   ├── course/
│   │   │   │   ├── DebutantMap.jsx
│   │   │   │   ├── LevelPage.jsx
│   │   │   │   ├── ExercisePage.jsx
│   │   │   │   └── CourseStyles.css
│   │   │   └── dashboardClient/
│   │   │       ├── DashboardPage.jsx
│   │   │       ├── ProfilePage.jsx
│   │   │       └── layout/
│   │   └── App.jsx
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── middlewares/
│   └── package.json
└── README.md
```

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (v14 ou supérieur)
- MongoDB
- npm ou yarn

### Installation
```bash
# Cloner le repository
git clone https://github.com/yassingmati/GenesisCode.git
cd GenesisCode

# Installer les dépendances frontend
cd frontend
npm install

# Installer les dépendances backend
cd ../backend
npm install
```

### Démarrage
```bash
# Démarrer le backend
cd backend
npm start

# Démarrer le frontend (nouveau terminal)
cd frontend
npm start
```

## 🌐 Accès
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5000

## 📝 Types d'Exercices Supportés

- **QCM** - Questions à choix multiples
- **TextInput** - Saisie de texte
- **DragDrop** - Glisser-déposer
- **Code** - Exercices de programmation
- **OrderBlocks** - Réorganisation de blocs
- **FillInTheBlank** - Texte à trous
- **SpotTheError** - Détection d'erreurs
- **Matching** - Association d'éléments

## 🎯 Fonctionnalités Avancées

### Système de Progression
- **Suivi des niveaux** et exercices complétés
- **Points d'expérience** (XP) et système de récompenses
- **Statistiques détaillées** de performance

### Interface Utilisateur
- **Design moderne** et responsive
- **Animations fluides** avec Framer Motion
- **Accessibilité** complète (ARIA, navigation clavier)
- **Thème sombre/clair** (en développement)

### Gestion des Médias
- **Support PDF** avec visualiseur intégré
- **Lecteur vidéo** avec contrôles personnalisés
- **Upload sécurisé** de fichiers

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer de nouvelles fonctionnalités
- Améliorer la documentation
- Optimiser les performances

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 👥 Équipe

- **Développement** : Équipe GenesisCode
- **Design** : Interface moderne et intuitive
- **Architecture** : Scalable et maintenable

## 🎉 Remerciements

Merci à tous les contributeurs et utilisateurs de GenesisCode pour leur soutien et leurs retours précieux !

---

**GenesisCode** - *Apprendre, Progresser, Réussir* 🚀✨
