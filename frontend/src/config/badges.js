// src/config/badges.js
import { StarIcon, FireIcon, TrophyIcon, BookOpenIcon, BoltIcon } from '@heroicons/react/24/solid';

export const BADGES = {
    XP_NOVICE: {
        id: 'XP_NOVICE',
        title: 'Débutant Motivé',
        description: 'Avoir gagné 100 XP',
        color: 'bg-blue-100 text-blue-600',
        icon: StarIcon
    },
    XP_APPRENTICE: {
        id: 'XP_APPRENTICE',
        title: 'Apprenti Codeur',
        description: 'Avoir gagné 500 XP',
        color: 'bg-purple-100 text-purple-600',
        icon: BoltIcon
    },
    XP_MASTER: {
        id: 'XP_MASTER',
        title: 'Maître du Code',
        description: 'Avoir gagné 1000 XP',
        color: 'bg-yellow-100 text-yellow-600',
        icon: TrophyIcon
    },
    STREAK_3: {
        id: 'STREAK_3',
        title: '3 Jours de Suite',
        description: 'Connectez-vous 3 jours de suite',
        color: 'bg-orange-100 text-orange-600',
        icon: FireIcon
    },
    STREAK_7: {
        id: 'STREAK_7',
        title: 'Semaine de Feu',
        description: 'Connectez-vous 7 jours de suite',
        color: 'bg-red-100 text-red-600',
        icon: FireIcon
    },
    FIRST_EXERCISE: {
        id: 'FIRST_EXERCISE',
        title: 'Premier Pas',
        description: 'Premier exercice complété',
        color: 'bg-green-100 text-green-600',
        icon: BookOpenIcon
    },
    EXERCISE_MASTER_10: {
        id: 'EXERCISE_MASTER_10',
        title: 'Dévoué',
        description: '10 exercices complétés',
        color: 'bg-teal-100 text-teal-600',
        icon: BookOpenIcon
    }
};

export const getBadgeConfig = (badgeId) => {
    if (BADGES[badgeId]) return BADGES[badgeId];

    if (badgeId && badgeId.startsWith('PATH_')) {
        return {
            id: badgeId,
            title: 'Parcours Terminé',
            description: 'Vous avez complété un parcours !',
            color: 'bg-indigo-100 text-indigo-600',
            icon: TrophyIcon
        };
    }

    return {
        id: badgeId,
        title: 'Badge Inconnu',
        description: '???',
        color: 'bg-gray-100 text-gray-600',
        icon: StarIcon
    };
};
