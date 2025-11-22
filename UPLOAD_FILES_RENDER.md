# Guide : Uploader les Fichiers sur Render

## 🎯 Objectif
Uploader les vidéos et PDFs directement sur Render via l'interface admin pour qu'ils soient disponibles sur le serveur déployé.

## 📋 Étapes Détaillées

### 1. Accéder à l'Interface Admin

1. Ouvrez votre navigateur
2. Allez sur : **https://codegenesis-platform.web.app/admin**
3. Connectez-vous avec vos identifiants admin

### 2. Naviguer vers la Gestion des Cours

1. Dans le menu admin, cliquez sur **"Gestion des Cours"** ou **"Course Management"**
2. Sélectionnez le **Path** (Parcours) contenant les niveaux
3. Cliquez sur le niveau que vous voulez modifier (ex: "Fonctions et Portées")

### 3. Uploader les Fichiers

Pour chaque niveau, vous pouvez uploader :

#### Vidéos
- **Français (FR)** : Cliquez sur le champ vidéo FR, sélectionnez votre fichier vidéo (.mp4, .mov, .avi, .webm)
- **Anglais (EN)** : Même processus pour la version anglaise
- **Arabe (AR)** : Même processus pour la version arabe

#### PDFs
- **Français (FR)** : Cliquez sur le champ PDF FR, sélectionnez votre fichier PDF
- **Anglais (EN)** : Même processus pour la version anglaise
- **Arabe (AR)** : Même processus pour la version arabe

### 4. Sauvegarder

1. Une fois les fichiers sélectionnés, cliquez sur **"Sauvegarder"** ou **"Enregistrer"**
2. Attendez que l'upload se termine (barre de progression visible)
3. Vérifiez les messages de confirmation

### 5. Vérifier

1. Allez sur la page du niveau : `https://codegenesis-platform.web.app/courses/levels/[levelId]`
2. Vérifiez que la vidéo et le PDF s'affichent correctement
3. Testez la lecture de la vidéo et l'ouverture du PDF

## ⚠️ Notes Importantes

- Les fichiers uploadés sur Render sont **temporaires** (perdus au redéploiement)
- Pour la production, envisagez un stockage cloud persistant
- La taille maximale des fichiers dépend de la configuration Render (généralement 100MB)

## 🔍 En cas de problème

1. Vérifiez la console du navigateur (F12) pour les erreurs
2. Vérifiez les logs Render dans le dashboard
3. Assurez-vous que les fichiers respectent les formats acceptés :
   - Vidéos : .mp4, .mov, .avi, .mkv, .webm
   - PDFs : .pdf

