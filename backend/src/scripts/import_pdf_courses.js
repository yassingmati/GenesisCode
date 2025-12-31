
const mongoose = require('mongoose');
const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');
require('dotenv').config();

const Category = require('../models/Category');
const Path = require('../models/Path');
const Level = require('../models/Level');
const Exercise = require('../models/Exercise');
const TRANSLATION_MAP = require('./course_translation_map');

const PDF_PATH = path.join(__dirname, '../../java (1).pdf');

// Mappings for category names to standardized names/translations
const CATEGORY_MAPPINGS = {
    'Learn Java Details': {
        en: 'Java Programming',
        fr: 'Programmation Java',
        ar: 'برمجة دجافا',
        key: 'java'
    },
    'Scratch': {
        en: 'Scratch Programming',
        fr: 'Programmation Scratch',
        ar: 'برمجة سكراتش',
        key: 'scratch'
    },
    'Learn Python Basics': {
        en: 'Python Basics',
        fr: 'Bases de Python',
        ar: 'أساسيات بايثون',
        key: 'python-basics'
    },
    '3. Learn Python Intermediate': {
        en: 'Python Intermediate',
        fr: 'Python Intermédiaire',
        ar: 'بايثون مستوى متوسط',
        key: 'python-intermediate'
    },
    'Practice: Python Intermediate': {
        en: 'Python Practice',
        fr: 'Pratique Python',
        ar: 'ممارسة بايثون',
        key: 'python-practice'
    },
    'html': {
        en: 'HTML',
        fr: 'HTML',
        ar: 'HTML',
        key: 'html'
    },
    'css': {
        en: 'CSS',
        fr: 'CSS',
        ar: 'CSS',
        key: 'css'
    }
};

const isCategoryHeader = (line) => {
    return Object.keys(CATEGORY_MAPPINGS).includes(line.trim());
};

const isPathHeader = (line) => {
    return /^(Ch|chapitre|Ch)\s*\d+/i.test(line.trim());
};

const isLevelItem = (line) => {
    return line.trim().startsWith('•');
};

const getTranslation = (text, lang) => {
    // Remove bullets if present effectively
    const cleanText = text.replace(/^[•·]\s*/, '').trim();

    // 1. Try exact match
    if (TRANSLATION_MAP[cleanText] && TRANSLATION_MAP[cleanText][lang]) {
        return TRANSLATION_MAP[cleanText][lang];
    }

    // 2. Try partial match / fuzzy
    // (Simple heuristic: look for keys contained in text)
    // For now, return original if not found
    return lang === 'en' ? cleanText : cleanText;
};

const parsePDFData = async () => {
    const dataBuffer = fs.readFileSync(PDF_PATH);
    const data = await pdf(dataBuffer);
    const text = data.text;

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    const categories = [];
    let currentPath = null;

    // Default to Java category initially
    let currentCategory = {
        originalName: 'Implicit Java',
        mapping: CATEGORY_MAPPINGS['Learn Java Details'],
        paths: []
    };
    categories.push(currentCategory);

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check for Category Header
        if (CATEGORY_MAPPINGS[line]) {
            currentCategory = {
                originalName: line,
                mapping: CATEGORY_MAPPINGS[line],
                paths: []
            };
            categories.push(currentCategory);
            currentPath = null;
            continue;
        }

        // Check for Path Header
        if (isPathHeader(line)) {
            // Safety: If no category yet, and we found a path, assign to Java if it looks like Java chapters
            if (!currentCategory && categories.length === 0) {
                console.warn(`Found path "${line}" before any category. Skipping or assuming default.`);
                continue;
            }

            if (currentCategory) {
                currentPath = {
                    name: line,
                    levels: []
                };
                currentCategory.paths.push(currentPath);
            }
            continue;
        }

        // Check for Level Item
        if (isLevelItem(line)) {
            if (currentPath) {
                const levelTitle = line.replace(/^[•·]\s*/, '').trim();
                currentPath.levels.push(levelTitle);
            }
            continue;
        }
    }

    return categories;
};

const runMigration = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is missing');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Parse Data
        console.log('Parsing PDF...');
        const parsedCategories = await parsePDFData();
        console.log(`Parsed ${parsedCategories.length} categories.`);

        // 2. Clear Old Data
        console.log('Clearing existing specific categories...');
        const oldCategories = await Category.find({ type: 'specific' });
        const oldCategoryIds = oldCategories.map(c => c._id);

        const oldPaths = await Path.find({ category: { $in: oldCategoryIds } });
        const oldPathIds = oldPaths.map(p => p._id);

        const oldLevels = await Level.find({ path: { $in: oldPathIds } });
        const oldLevelIds = oldLevels.map(l => l._id);

        console.log(`Deleting ${oldCategories.length} categories, ${oldPaths.length} paths, ${oldLevels.length} levels.`);

        await Level.deleteMany({ _id: { $in: oldLevelIds } });
        await Path.deleteMany({ _id: { $in: oldPathIds } });
        await Category.deleteMany({ _id: { $in: oldCategoryIds } });

        console.log('Old data cleared.');

        // 3. Insert New Data
        console.log('Inserting new data with translations...');

        for (const catData of parsedCategories) {
            // Create Category
            const category = new Category({
                translations: {
                    fr: { name: catData.mapping.fr },
                    en: { name: catData.mapping.en },
                    ar: { name: catData.mapping.ar }
                },
                type: 'specific',
                order: 0 // You might want to increment this
            });
            await category.save();

            let pathOrder = 1;
            for (const pathData of catData.paths) {
                const pathName = pathData.name.replace(/^(Ch|chapitre|Ch)\s*\d+\s*[:\.]\s*/i, '').trim();
                const pathPrefix = pathData.name.match(/^(Ch|chapitre|Ch|Chapitre)\s*\d+/i)?.[0] || '';

                // Keep the chapter number format but translate the title
                const frName = `${pathPrefix} : ${getTranslation(pathName, 'fr')}`;
                const enName = `${pathPrefix}: ${getTranslation(pathName, 'en')}`;
                const arName = `${pathPrefix}: ${getTranslation(pathName, 'ar')}`;

                // Create Path
                const pathDoc = new Path({
                    translations: {
                        fr: { name: frName, description: '' },
                        en: { name: enName, description: '' },
                        ar: { name: arName, description: '' }
                    },
                    category: category._id,
                    order: pathOrder++,
                    levels: []
                });
                await pathDoc.save();

                let levelOrder = 1;
                for (const levelTitle of pathData.levels) {
                    const cleanTitle = levelTitle.replace(/^[•·]\s*/, '').trim();

                    // Create Level
                    const levelDoc = new Level({
                        translations: {
                            fr: { title: getTranslation(cleanTitle, 'fr'), content: 'Contenu du cours...' },
                            en: { title: getTranslation(cleanTitle, 'en'), content: 'Course content...' },
                            ar: { title: getTranslation(cleanTitle, 'ar'), content: 'محتوى الدورة...' }
                        },
                        path: pathDoc._id,
                        order: levelOrder++,
                        exercises: [], // No exercises for now
                        videos: { fr: '', en: '', ar: '' },
                        pdfs: { fr: '', en: '', ar: '' }
                    });
                    await levelDoc.save();

                    // Link level to path
                    pathDoc.levels.push(levelDoc._id);
                }
                await pathDoc.save();
            }
        }

        console.log('Migration completed successfully!');
        process.exit(0);

    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

runMigration();
