// Débloquer les premiers levels de chaque path de la catégorie "Débutant"
const mongoose = require('mongoose');
const CategoryAccess = require('./src/models/CategoryAccess');
const User = require('./src/models/User');
const Category = require('./src/models/Category');
const Path = require('./src/models/Path');
const Level = require('./src/models/Level');

const userId = '68f6460c74ab496c1885e395';
const categoryId = '68f258d68ffd13c2ba35e4a5'; // Débutant

async function unlockFirstLevels() {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codegenesis');
    console.log('✅ Connexion à la base de données réussie');

    // Récupérer l'accès à la catégorie (sans populate pour éviter l'erreur CategoryPlan)
    const categoryAccess = await CategoryAccess.findOne({
      user: userId,
      category: categoryId,
      status: 'active',
      $or: [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: null }
      ]
    });
    
    if (!categoryAccess) {
      console.log('❌ Aucun accès à la catégorie trouvé');
      return;
    }

    console.log(`✅ Accès à la catégorie trouvé: ${categoryAccess._id}`);

    // Récupérer tous les paths de la catégorie
    const paths = await Path.find({ category: categoryId });
    console.log(`📋 Paths trouvés: ${paths.length}`);

    let unlockedCount = 0;

    for (const path of paths) {
      console.log(`\n🔍 Traitement du path: ${path._id}`);
      
      // Récupérer le premier level du path (order: 1)
      const firstLevel = await Level.findOne({ path: path._id, order: 1 });
      
      if (firstLevel) {
        console.log(`   ✅ Premier level trouvé: ${firstLevel._id} (order: ${firstLevel.order})`);
        
        // Vérifier si déjà débloqué
        const alreadyUnlocked = categoryAccess.unlockedLevels.find(
          unlock => unlock.path.toString() === path._id.toString() && 
                    unlock.level.toString() === firstLevel._id.toString()
        );
        
        if (alreadyUnlocked) {
          console.log(`   ⚠️  Level déjà débloqué`);
        } else {
          // Ajouter le level directement (sans utiliser unlockLevel qui sauvegarde)
          categoryAccess.unlockedLevels.push({
            path: path._id,
            level: firstLevel._id,
            unlockedAt: new Date()
          });
          console.log(`   🔓 Level débloqué avec succès`);
          unlockedCount++;
        }
      } else {
        console.log(`   ❌ Aucun premier level trouvé pour ce path`);
      }
    }

    // Sauvegarder tous les changements en une fois
    if (unlockedCount > 0) {
      await categoryAccess.save();
      console.log(`\n💾 Changements sauvegardés avec succès`);
    }

    console.log(`\n🎉 Résultat: ${unlockedCount} levels débloqués`);
    console.log(`📊 Total unlocked levels: ${categoryAccess.unlockedLevels.length}`);

    // Afficher les levels débloqués
    if (categoryAccess.unlockedLevels.length > 0) {
      console.log(`\n📋 Levels débloqués:`);
      for (const unlock of categoryAccess.unlockedLevels) {
        console.log(`   - Path: ${unlock.path}, Level: ${unlock.level}, Date: ${unlock.unlockedAt}`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Déconnexion de la base de données');
  }
}

unlockFirstLevels();
