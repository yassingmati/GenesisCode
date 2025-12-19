// src/config/BadgeRegistry.js

const BADGES = {
    // --- XP BASED ---
    XP_NOVICE: {
        id: 'XP_NOVICE',
        title: 'Débutant Motivé',
        description: 'Avoir gagné 100 XP',
        icon: 'star',
        criteria: { type: 'xp', value: 100 }
    },
    XP_APPRENTICE: {
        id: 'XP_APPRENTICE',
        title: 'Apprenti Codeur',
        description: 'Avoir gagné 500 XP',
        icon: 'medal',
        criteria: { type: 'xp', value: 500 }
    },
    XP_MASTER: {
        id: 'XP_MASTER',
        title: 'Maître du Code',
        description: 'Avoir gagné 1000 XP',
        icon: 'trophy',
        criteria: { type: 'xp', value: 1000 }
    },

    // --- STREAK BASED ---
    STREAK_3: {
        id: 'STREAK_3',
        title: '3 Jours de Suite',
        description: 'Connectez-vous 3 jours de suite',
        icon: 'flame',
        criteria: { type: 'streak', value: 3 }
    },
    STREAK_7: {
        id: 'STREAK_7',
        title: 'Semaine de Feu',
        description: 'Connectez-vous 7 jours de suite',
        icon: 'fire',
        criteria: { type: 'streak', value: 7 }
    },

    // --- EXERCISE BASED ---
    FIRST_EXERCISE: {
        id: 'FIRST_EXERCISE',
        title: 'Premier Pas',
        description: 'Compléter votre premier exercice',
        icon: 'check',
        criteria: { type: 'exercises', value: 1 }
    },
    EXERCISE_MASTER_10: {
        id: 'EXERCISE_MASTER_10',
        title: 'Dévoué',
        description: 'Compléter 10 exercices',
        icon: 'book',
        criteria: { type: 'exercises', value: 10 }
    }
};

module.exports = BADGES;
