const mongoose = require('mongoose');
const Category = require('../models/Category');

async function testCategoryType() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/genesis', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('🧪 Test des types de catégories...\n');

    // Test 1: Vérifier que les catégories existantes ont le champ type
    const categories = await Category.find({});
    console.log(`📊 Total des catégories: ${categories.length}`);
    
    const classicCategories = await Category.find({ type: 'classic' });
    const specificCategories = await Category.find({ type: 'specific' });
    const noTypeCategories = await Category.find({ type: { $exists: false } });
    
    console.log(`📚 Catégories classiques: ${classicCategories.length}`);
    console.log(`🎯 Catégories spécifiques: ${specificCategories.length}`);
    console.log(`❓ Catégories sans type: ${noTypeCategories.length}\n`);

    // Test 2: Créer une catégorie de test
    console.log('🔧 Création d\'une catégorie de test...');
    const testCategory = await Category.create({
      translations: {
        fr: { name: 'Test Type' },
        en: { name: 'Test Type' },
        ar: { name: 'نوع الاختبار' }
      },
      type: 'specific',
      order: 999
    });
    console.log(`✅ Catégorie de test créée: ${testCategory._id}`);

    // Test 3: Vérifier la création
    const createdCategory = await Category.findById(testCategory._id);
    console.log(`🔍 Type de la catégorie créée: ${createdCategory.type}`);

    // Test 4: Mettre à jour le type
    await Category.findByIdAndUpdate(testCategory._id, { type: 'classic' });
    const updatedCategory = await Category.findById(testCategory._id);
    console.log(`🔄 Type après mise à jour: ${updatedCategory.type}`);

    // Test 5: Supprimer la catégorie de test
    await Category.findByIdAndDelete(testCategory._id);
    console.log('🗑️ Catégorie de test supprimée');

    // Test 6: Vérifier les filtres par type
    console.log('\n🔍 Test des filtres par type:');
    const allClassic = await Category.find({ type: 'classic' });
    const allSpecific = await Category.find({ type: 'specific' });
    
    console.log(`📚 Toutes les catégories classiques: ${allClassic.length}`);
    console.log(`🎯 Toutes les catégories spécifiques: ${allSpecific.length}`);

    // Test 7: Vérifier les catégories sans type (devraient être mises à jour)
    if (noTypeCategories.length > 0) {
      console.log('\n⚠️ Catégories sans type trouvées:');
      noTypeCategories.forEach(cat => {
        console.log(`  - ${cat.translations?.fr?.name || 'Sans nom'} (${cat._id})`);
      });
      console.log('💡 Ces catégories devraient être mises à jour avec le type "classic"');
    }

    console.log('\n✅ Tests terminés avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion fermée');
  }
}

// Exécuter les tests
testCategoryType();


