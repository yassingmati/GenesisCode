const Path = require('../../src/models/Path');
const Level = require('../../src/models/Level');

/**
 * Fixtures pour les paths et levels de test
 */
module.exports = {
  /**
   * Créer un path de test
   */
  async createTestPath(categoryId, overrides = {}) {
    const defaultPath = {
      translations: {
        fr: { 
          name: `Parcours Test ${Date.now()}`,
          description: 'Description du parcours de test'
        },
        en: { 
          name: `Test Path ${Date.now()}`,
          description: 'Test path description'
        },
        ar: { 
          name: `مسار اختبار ${Date.now()}`,
          description: 'وصف مسار الاختبار'
        }
      },
      category: categoryId,
      order: 0,
      levels: [],
      ...overrides
    };

    return await Path.create(defaultPath);
  },

  /**
   * Créer un level de test
   */
  async createTestLevel(pathId, order = 0, overrides = {}) {
    const defaultLevel = {
      translations: {
        fr: {
          title: `Niveau ${order + 1}`,
          content: `Contenu du niveau ${order + 1}`
        },
        en: {
          title: `Level ${order + 1}`,
          content: `Content of level ${order + 1}`
        },
        ar: {
          title: `المستوى ${order + 1}`,
          content: `محتوى المستوى ${order + 1}`
        }
      },
      path: pathId,
      order: order,
      exercises: [],
      videos: {
        fr: null,
        en: null,
        ar: null
      },
      pdfs: {
        fr: null,
        en: null,
        ar: null
      },
      ...overrides
    };

    return await Level.create(defaultLevel);
  },

  /**
   * Créer un path avec plusieurs niveaux
   */
  async createPathWithLevels(categoryId, levelCount = 3) {
    const path = await this.createTestPath(categoryId);
    const levels = [];

    for (let i = 0; i < levelCount; i++) {
      const level = await this.createTestLevel(path._id, i);
      levels.push(level);
    }

    path.levels = levels.map(l => l._id);
    await path.save();

    return { path, levels };
  },

  /**
   * Données brutes pour créer un path (sans sauvegarde)
   */
  getRawPathData(categoryId, overrides = {}) {
    return {
      translations: {
        fr: { 
          name: `Parcours Test ${Date.now()}`,
          description: 'Description du parcours'
        },
        en: { 
          name: `Test Path ${Date.now()}`,
          description: 'Path description'
        },
        ar: { 
          name: `مسار اختبار ${Date.now()}`,
          description: 'وصف المسار'
        }
      },
      category: categoryId,
      order: 0,
      levels: [],
      ...overrides
    };
  },

  /**
   * Données brutes pour créer un level (sans sauvegarde)
   */
  getRawLevelData(pathId, order = 0, overrides = {}) {
    return {
      translations: {
        fr: {
          title: `Niveau ${order + 1}`,
          content: `Contenu du niveau ${order + 1}`
        },
        en: {
          title: `Level ${order + 1}`,
          content: `Content of level ${order + 1}`
        },
        ar: {
          title: `المستوى ${order + 1}`,
          content: `محتوى المستوى ${order + 1}`
        }
      },
      path: pathId,
      order: order,
      exercises: [],
      ...overrides
    };
  }
};

