# Migration vers Firebase Storage

## 🎯 Objectif
Migrer le stockage des fichiers (vidéos et PDFs) vers Firebase Storage pour un stockage persistant et scalable.

## ✅ Avantages

- **Persistant** : Les fichiers survivent aux redéploiements
- **CDN intégré** : Distribution rapide mondiale
- **Scalable** : Gère automatiquement la charge
- **Sécurisé** : Contrôle d'accès intégré
- **Plan gratuit généreux** : 5GB de stockage, 1GB/jour de transfert

## 📋 Étapes de Migration

### 1. Configuration Firebase Storage

#### A. Activer Firebase Storage

1. Allez sur https://console.firebase.google.com
2. Sélectionnez votre projet
3. Allez dans **Storage** dans le menu de gauche
4. Cliquez sur **"Commencer"** ou **"Get started"**
5. Choisissez le mode de sécurité :
   - **Mode test** : Pour le développement (accès public temporaire)
   - **Mode production** : Règles de sécurité strictes (recommandé)

#### B. Configurer les Règles de Sécurité

Dans Firebase Console > Storage > Rules, configurez :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Vidéos et PDFs des cours - accès authentifié uniquement
    match /courses/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      request.auth.token.admin == true;
    }
    
    // Structure: courses/videos/{levelId}/{lang}/{filename}
    // Structure: courses/pdfs/{levelId}/{lang}/{filename}
  }
}
```

### 2. Installation des Dépendances

```bash
cd backend
npm install firebase-admin
```

### 3. Configuration Backend

#### A. Créer le Service Firebase Storage

Créez `backend/src/services/firebaseStorageService.js` :

```javascript
const admin = require('firebase-admin');
const path = require('path');

// Initialiser Firebase Admin (déjà fait dans votre config)
// Assurez-vous que firebase-admin est initialisé dans index.js

const bucket = admin.storage().bucket();

/**
 * Upload un fichier vers Firebase Storage
 */
async function uploadFile(file, destinationPath) {
  try {
    const fileRef = bucket.file(destinationPath);
    const stream = fileRef.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
      resumable: false
    });

    return new Promise((resolve, reject) => {
      stream.on('error', reject);
      stream.on('finish', async () => {
        // Rendre le fichier public (ou utiliser signed URLs)
        await fileRef.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destinationPath}`;
        resolve(publicUrl);
      });
      file.stream.pipe(stream);
    });
  } catch (error) {
    console.error('Erreur upload Firebase Storage:', error);
    throw error;
  }
}

/**
 * Obtenir l'URL publique d'un fichier
 */
async function getFileUrl(filePath) {
  try {
    const fileRef = bucket.file(filePath);
    const [exists] = await fileRef.exists();
    if (!exists) {
      return null;
    }
    return `https://storage.googleapis.com/${bucket.name}/${filePath}`;
  } catch (error) {
    console.error('Erreur récupération URL:', error);
    return null;
  }
}

/**
 * Supprimer un fichier
 */
async function deleteFile(filePath) {
  try {
    await bucket.file(filePath).delete();
    return true;
  } catch (error) {
    console.error('Erreur suppression fichier:', error);
    return false;
  }
}

module.exports = {
  uploadFile,
  getFileUrl,
  deleteFile
};
```

#### B. Modifier CourseController pour utiliser Firebase Storage

Dans `backend/src/controllers/CourseController.js`, modifiez les fonctions d'upload :

```javascript
const firebaseStorage = require('../services/firebaseStorageService');

// Dans saveVideoPath
static saveVideoPath = catchErrors(async (req, res) => {
  const lang = req.body?.lang || req.query?.lang || '';
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });
  
  const levelId = req.params.levelId;
  const destinationPath = `courses/videos/${levelId}/${lang}/${req.file.filename}`;
  
  // Upload vers Firebase Storage
  const publicUrl = await firebaseStorage.uploadFile(req.file, destinationPath);
  
  // Sauvegarder l'URL dans MongoDB (au lieu du chemin local)
  const level = await Level.findById(levelId);
  level.videos = level.videos || {};
  level.videos[lang] = publicUrl; // URL Firebase Storage
  await level.save();
  
  res.json({
    message: `Vidéo (${lang}) enregistrée`,
    url: publicUrl,
    videos: level.videos
  });
});

// Même chose pour savePDFPath
```

#### C. Modifier les fonctions de streaming

Pour les fichiers sur Firebase Storage, vous pouvez soit :
1. Rediriger vers l'URL publique Firebase Storage
2. Streamer via le backend (proxy)

```javascript
// Option 1: Redirection (plus simple)
static streamVideo = catchErrors(async (req, res) => {
  const { lang } = req.query;
  const level = await Level.findById(req.params.levelId).select('videos').lean();
  const videoUrl = level?.videos?.[lang];
  
  if (!videoUrl) return res.status(404).json({ error: 'Vidéo introuvable' });
  
  // Si c'est une URL Firebase Storage, rediriger
  if (videoUrl.startsWith('https://storage.googleapis.com/')) {
    return res.redirect(videoUrl);
  }
  
  // Sinon, utiliser le système local (backward compatibility)
  // ... code existant
});
```

### 4. Migration des Fichiers Existants

Créez un script de migration `backend/src/scripts/migrateToFirebaseStorage.js` :

```javascript
const mongoose = require('mongoose');
const Level = require('../models/Level');
const firebaseStorage = require('../services/firebaseStorageService');
const fs = require('fs').promises;
const path = require('path');

async function migrateLevel(level) {
  const updates = {};
  
  // Migrer les vidéos
  if (level.videos) {
    for (const [lang, videoPath] of Object.entries(level.videos)) {
      if (videoPath && !videoPath.startsWith('http')) {
        // C'est un chemin local, migrer vers Firebase Storage
        const localPath = path.resolve(__dirname, '..', videoPath.replace(/^\//, ''));
        try {
          await fs.access(localPath);
          const fileBuffer = await fs.readFile(localPath);
          const filename = path.basename(localPath);
          const destinationPath = `courses/videos/${level._id}/${lang}/${filename}`;
          
          // Upload vers Firebase Storage
          const publicUrl = await firebaseStorage.uploadFile({
            buffer: fileBuffer,
            mimetype: 'video/mp4',
            filename: filename
          }, destinationPath);
          
          updates[`videos.${lang}`] = publicUrl;
          console.log(`✅ Vidéo ${lang} migrée: ${publicUrl}`);
        } catch (err) {
          console.error(`❌ Erreur migration vidéo ${lang}:`, err.message);
        }
      }
    }
  }
  
  // Même chose pour les PDFs
  // ...
  
  if (Object.keys(updates).length > 0) {
    await Level.findByIdAndUpdate(level._id, { $set: updates });
    console.log(`✅ Niveau ${level._id} migré`);
  }
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const levels = await Level.find({});
  
  for (const level of levels) {
    await migrateLevel(level);
  }
  
  await mongoose.disconnect();
  console.log('✅ Migration terminée');
}

main();
```

### 5. Déploiement

1. **Mettre à jour les variables d'environnement** sur Render :
   - `FIREBASE_STORAGE_ENABLED=true`
   - Vérifier que `GOOGLE_APPLICATION_CREDENTIALS` ou la config Firebase est présente

2. **Déployer le code** :
   ```bash
   git add .
   git commit -m "Migration vers Firebase Storage"
   git push origin main
   ```

3. **Exécuter la migration** (une seule fois) :
   ```bash
   node backend/src/scripts/migrateToFirebaseStorage.js
   ```

## 🔍 Vérification

1. Uploader un nouveau fichier via l'interface admin
2. Vérifier dans Firebase Console > Storage que le fichier apparaît
3. Vérifier que l'URL dans MongoDB pointe vers Firebase Storage
4. Tester l'affichage dans l'application

## 📝 Notes

- Les anciens fichiers locaux peuvent être supprimés après migration
- Les URLs Firebase Storage sont publiques mais protégées par les règles de sécurité
- Pour plus de sécurité, utilisez des signed URLs au lieu de rendre les fichiers publics

