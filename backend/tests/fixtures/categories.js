const Category = require('../../src/models/Category');

/**
 * Fixtures pour les catégories de test
 */
module.exports = {
  /**
   * Créer une catégorie de test
   */
  async createTestCategory(overrides = {}) {
    const defaultCategory = {
      translations: {
        fr: { name: `Catégorie Test ${Date.now()}` },
        en: { name: `Test Category ${Date.now()}` },
        ar: { name: `فئة اختبار ${Date.now()}` }
      },
      type: 'classic',
      order: 0,
      ...overrides
    };

    return await Category.create(defaultCategory);
  },

  /**
   * Créer une catégorie spécifique (langue)
   */
  async createSpecificCategory(overrides = {}) {
    return await this.createTestCategory({
      type: 'specific',
      ...overrides
    });
  },

  /**
   * Créer plusieurs catégories
   */
  async createMultipleCategories(count = 3) {
    const categories = [];
    for (let i = 0; i < count; i++) {
      const category = await this.createTestCategory({
        translations: {
          fr: { name: `Catégorie ${i + 1}` },
          en: { name: `Category ${i + 1}` },
          ar: { name: `فئة ${i + 1}` }
        },
        order: i
      });
      categories.push(category);
    }
    return categories;
  },

  /**
   * Données brutes pour créer une catégorie (sans sauvegarde)
   */
  getRawCategoryData(overrides = {}) {
    return {
      translations: {
        fr: { name: `Catégorie Test ${Date.now()}` },
        en: { name: `Test Category ${Date.now()}` },
        ar: { name: `فئة اختبار ${Date.now()}` }
      },
      type: 'classic',
      order: 0,
      ...overrides
    };
  }
};

