# Solution pour le Stockage de Fichiers sur Render

## ⚠️ Problème Identifié

Render utilise un **système de fichiers éphémère**. Cela signifie que :
- Les fichiers uploadés localement ne sont **pas** sur Render
- Les fichiers sont **perdus** à chaque redéploiement
- Les fichiers uploadés via l'interface admin sur Render sont **temporaires**

## 🔍 Erreur Actuelle

```
{"error":"Fichier PDF manquant", 
 "path": "/opt/render/project/src/backend/src/uploads/pdfs/pdfs-1763810256597-581844341.pdf", 
 "relPath":"/uploads/pdfs/pdfs-1763810256597-581844341.pdf"}
```

## ✅ Solutions Recommandées

### Solution 1 : Upload Direct sur Render (Temporaire)

1. Connectez-vous à l'application déployée : https://codegenesis-platform.web.app
2. Allez dans l'interface admin
3. Uploader les fichiers directement depuis l'interface admin sur Render
4. **Note** : Ces fichiers seront perdus au prochain redéploiement

### Solution 2 : Stockage Cloud (Recommandé pour Production)

#### Option A : AWS S3
- Stockage persistant et scalable
- Intégration avec Multer-S3
- Coût : ~$0.023/GB/mois

#### Option B : Cloudinary
- Gestion automatique des images/vidéos
- Transformation à la volée
- Plan gratuit disponible

#### Option C : Firebase Storage
- Intégration facile avec Firebase
- Plan gratuit généreux
- CDN intégré

### Solution 3 : Volume Persistant Render (Payant)

Render offre des volumes persistants pour les plans payants :
- Les fichiers survivent aux redéploiements
- Configuration dans le dashboard Render
- Coût : À partir de $0.25/GB/mois

## 🚀 Solution Immédiate (Quick Fix)

Pour tester rapidement, uploader les fichiers directement sur Render :

1. **Via l'interface admin déployée** :
   - Allez sur https://codegenesis-platform.web.app/admin
   - Connectez-vous en tant qu'admin
   - Allez dans la gestion des cours
   - Uploader les vidéos et PDFs pour chaque niveau

2. **Vérification** :
   - Les fichiers seront stockés dans `/opt/render/project/src/backend/src/uploads/`
   - Ils seront accessibles jusqu'au prochain redéploiement

## 📝 Code à Modifier pour Stockage Cloud

Si vous choisissez une solution cloud, voici les modifications nécessaires :

### Exemple avec Multer-S3 (AWS S3)

```javascript
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    key: function (req, file, cb) {
      const folder = file.fieldname === 'video' ? 'videos' : 'pdfs';
      cb(null, `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
    }
  })
});
```

## 🎯 Recommandation

Pour la **production**, utilisez **Firebase Storage** ou **AWS S3** :
- Stockage persistant
- CDN intégré
- Scalable
- Coûts raisonnables

Pour le **développement/test**, uploader directement sur Render via l'interface admin.

