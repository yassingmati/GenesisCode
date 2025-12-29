
import React from 'react';
import { LayoutDashboard, BookOpen, BarChart3, User, Trophy, Rocket, Lightbulb, CheckCircle2, Flame, Bell } from 'lucide-react';

export const MENU_ITEMS = [
  { label: 'Tableau de bord', icon: <LayoutDashboard size={20} />, active: true },
  { label: 'Cours récents', icon: <BookOpen size={20} />, active: false },
  { label: 'Statistiques', icon: <BarChart3 size={20} />, active: false },
  { label: 'Profil', icon: <User size={20} />, active: false },
];

export const COURSES = [
  {
    id: '1',
    title: 'Programmation Python',
    category: 'Python',
    progress: 80,
    completedExercises: 15,
    totalExercises: 20,
    color: 'from-blue-600 to-indigo-700',
    icon: '🐍'
  },
  {
    id: '2',
    title: 'Développement Web',
    category: 'HTML',
    progress: 60,
    completedExercises: 12,
    totalExercises: 20,
    color: 'from-orange-500 to-red-600',
    icon: '🌐'
  }
];

export const TASKS = [
  { id: 't1', label: 'Revoir les fonctions en Python', completed: false },
  { id: 't2', label: 'Terminer le cours CSS', completed: false },
  { id: 't3', label: 'Faire une pause (pomodoro)', completed: true },
];

export const LEADERBOARD = [
  { rank: 1, name: 'Mohamed Riahi', xp: 4188, initial: 'M', avatar: 'https://picsum.photos/seed/1/40/40' },
  { rank: 2, name: 'Ahmed Ben ali', xp: 1780, initial: 'A', avatar: 'https://picsum.photos/seed/2/40/40' },
  { rank: 3, name: 'Genesis Code', xp: 2648, initial: 'G', avatar: 'https://picsum.photos/seed/3/40/40' },
  { rank: 4, name: 'yassin fi', xp: 2053, initial: 'Y', avatar: 'https://picsum.photos/seed/4/40/40' },
  { rank: 5, name: 'Hakuna Matata', xp: 1320, initial: 'H', avatar: 'https://picsum.photos/seed/5/40/40' },
];
