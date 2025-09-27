import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

// Traductions pour toutes les langues supportées
const translations = {
  fr: {
    // Navigation et interface générale
    welcome: 'Bienvenue',
    welcomeMessage: 'Avant de commencer, dis-nous comment tu préfères apprendre :',
    startAdventure: 'Fais ton choix pour commencer l\'aventure !',
    back: 'Retour',
    loading: 'Chargement',
    error: 'Erreur',
    retry: 'Réessayer',
    close: 'Fermer',
    submit: 'Soumettre',
    start: 'Commencer',
    correct: 'Correct !',
    incorrect: 'Incorrect',
    
    // Cours et exercices
    courses: 'Cours',
    levels: 'Niveaux',
    exercises: 'Exercices',
    categories: 'Catégories',
    paths: 'Parcours',
    statistics: 'Statistiques',
    all: 'Toutes',
    withVideo: 'Avec vidéo',
    withPdf: 'Avec PDF',
    progress: 'Progression',
    levelNotFound: 'Niveau non trouvé',
    levelNotFoundDesc: 'Le niveau demandé n\'existe pas ou a été supprimé.',
    
    // Dashboard
    chooseLanguage: 'Choisir ton propre langage',
    chooseLanguageDesc: 'Sélectionne librement le langage que tu souhaites maîtriser',
    followPath: 'Suivre le parcours GenesisCode',
    followPathDesc: 'Laisse-toi guider par notre programme structuré',
    
    // Navigation et interface
    dashboard: 'Tableau de bord',
    tasks: 'Tâches',
    dailyTasks: 'Tâches du Jour',
    profile: 'Profil',
    pomodoro: 'Pomodoro',
    user: 'Utilisateur',
    logout: 'Déconnexion',
    myProfile: 'Mon profil',
    myTasks: 'Mes tâches',
    viewTasks: 'Voir les tâches',
    viewProfile: 'Voir le profil',
    startPomodoro: 'Démarrer un pomodoro',
    
    // Pomodoro
    pomodoroTimer: 'Pomodoro Timer',
    focus: 'Focus',
    pause: 'Pause',
    start: 'Démarrer',
    reset: 'Réinitialiser',
    focusTime: 'Temps de focus',
    shortBreak: 'Pause courte',
    longBreak: 'Pause longue',
    short: 'Courte',
    long: 'Longue',
    
    // Modal et confirmations
    confirmLogout: 'Confirmer la déconnexion',
    confirmLogoutMessage: 'Êtes-vous sûr de vouloir vous déconnecter ?',
    cancel: 'Annuler',
    
    // Footer
    allRightsReserved: 'Tous droits réservés',
    legalNotice: 'Mentions légales',
    contact: 'Contact',
    support: 'Support',
    
    // Header
    goToDashboard: 'Aller au tableau de bord',
    openMenu: 'Ouvrir le menu',
    
    // LevelPage
    video: 'Vidéo',
    noVideo: 'Aucune vidéo',
    noPdfAvailable: 'Aucun PDF disponible',
    selectOtherLanguage: 'Sélectionnez une autre langue',
    openPdf: 'Ouvrir PDF',
    play: 'Lire',
    pause: 'Pause',
    enlargeVideo: 'Agrandir la vidéo',
    previousLesson: 'Leçon précédente',
    nextLesson: 'Leçon suivante',
    quickActions: 'Actions rapides',
    print: 'Imprimer',
    copyLink: 'Copier le lien',
    
    // Recherche
    search: 'Rechercher'
  },
  
  en: {
    // Navigation et interface générale
    welcome: 'Welcome',
    welcomeMessage: 'Before we start, tell us how you prefer to learn:',
    startAdventure: 'Make your choice to start the adventure!',
    back: 'Back',
    loading: 'Loading',
    error: 'Error',
    retry: 'Retry',
    close: 'Close',
    submit: 'Submit',
    start: 'Start',
    correct: 'Correct!',
    incorrect: 'Incorrect',
    
    // Cours et exercices
    courses: 'Courses',
    levels: 'Levels',
    exercises: 'Exercises',
    categories: 'Categories',
    paths: 'Paths',
    statistics: 'Statistics',
    all: 'All',
    withVideo: 'With video',
    withPdf: 'With PDF',
    progress: 'Progress',
    levelNotFound: 'Level not found',
    levelNotFoundDesc: 'The requested level does not exist or has been deleted.',
    
    // Dashboard
    chooseLanguage: 'Choose your own language',
    chooseLanguageDesc: 'Freely select the language you want to master',
    followPath: 'Follow the GenesisCode path',
    followPathDesc: 'Let yourself be guided by our structured program',
    
    // Navigation et interface
    dashboard: 'Dashboard',
    tasks: 'Tasks',
    dailyTasks: 'Daily Tasks',
    profile: 'Profile',
    pomodoro: 'Pomodoro',
    user: 'User',
    logout: 'Logout',
    myProfile: 'My profile',
    myTasks: 'My tasks',
    viewTasks: 'View tasks',
    viewProfile: 'View profile',
    startPomodoro: 'Start a pomodoro',
    
    // Pomodoro
    pomodoroTimer: 'Pomodoro Timer',
    focus: 'Focus',
    pause: 'Pause',
    start: 'Start',
    reset: 'Reset',
    focusTime: 'Focus time',
    shortBreak: 'Short break',
    longBreak: 'Long break',
    short: 'Short',
    long: 'Long',
    
    // Modal et confirmations
    confirmLogout: 'Confirm logout',
    confirmLogoutMessage: 'Are you sure you want to logout?',
    cancel: 'Cancel',
    
    // Footer
    allRightsReserved: 'All rights reserved',
    legalNotice: 'Legal notice',
    contact: 'Contact',
    support: 'Support',
    
    // Header
    goToDashboard: 'Go to dashboard',
    openMenu: 'Open menu',
    
    // LevelPage
    video: 'Video',
    noVideo: 'No video',
    noPdfAvailable: 'No PDF available',
    selectOtherLanguage: 'Select another language',
    openPdf: 'Open PDF',
    play: 'Play',
    pause: 'Pause',
    enlargeVideo: 'Enlarge video',
    previousLesson: 'Previous lesson',
    nextLesson: 'Next lesson',
    quickActions: 'Quick actions',
    print: 'Print',
    copyLink: 'Copy link',
    
    // Recherche
    search: 'Search'
  },
  
  ar: {
    // Navigation et interface générale
    welcome: 'مرحباً',
    welcomeMessage: 'قبل أن نبدأ، أخبرنا كيف تفضل التعلم:',
    startAdventure: 'اتخذ اختيارك لبدء المغامرة!',
    back: 'رجوع',
    loading: 'جاري التحميل',
    error: 'خطأ',
    retry: 'إعادة المحاولة',
    close: 'إغلاق',
    submit: 'إرسال',
    start: 'بدء',
    correct: 'صحيح!',
    incorrect: 'خطأ',
    
    // Cours et exercices
    courses: 'الدورات',
    levels: 'المستويات',
    exercises: 'التمارين',
    categories: 'الفئات',
    paths: 'المسارات',
    statistics: 'الإحصائيات',
    all: 'الكل',
    withVideo: 'مع فيديو',
    withPdf: 'مع PDF',
    progress: 'التقدم',
    levelNotFound: 'المستوى غير موجود',
    levelNotFoundDesc: 'المستوى المطلوب غير موجود أو تم حذفه.',
    
    // Dashboard
    chooseLanguage: 'اختر لغتك الخاصة',
    chooseLanguageDesc: 'اختر بحرية اللغة التي تريد إتقانها',
    followPath: 'اتبع مسار GenesisCode',
    followPathDesc: 'دع نفسك تقود بواسطة برنامجنا المنظم',
    
    // Navigation et interface
    dashboard: 'لوحة التحكم',
    tasks: 'المهام',
    dailyTasks: 'مهام اليوم',
    profile: 'الملف الشخصي',
    pomodoro: 'بومودورو',
    user: 'المستخدم',
    logout: 'تسجيل الخروج',
    myProfile: 'ملفي الشخصي',
    myTasks: 'مهامي',
    viewTasks: 'عرض المهام',
    viewProfile: 'عرض الملف الشخصي',
    startPomodoro: 'بدء بومودورو',
    
    // Pomodoro
    pomodoroTimer: 'مؤقت بومودورو',
    focus: 'التركيز',
    pause: 'إيقاف مؤقت',
    start: 'بدء',
    reset: 'إعادة تعيين',
    focusTime: 'وقت التركيز',
    shortBreak: 'استراحة قصيرة',
    longBreak: 'استراحة طويلة',
    short: 'قصيرة',
    long: 'طويلة',
    
    // Modal et confirmations
    confirmLogout: 'تأكيد تسجيل الخروج',
    confirmLogoutMessage: 'هل أنت متأكد من أنك تريد تسجيل الخروج؟',
    cancel: 'إلغاء',
    
    // Footer
    allRightsReserved: 'جميع الحقوق محفوظة',
    legalNotice: 'الإشعار القانوني',
    contact: 'اتصل بنا',
    support: 'الدعم',
    
    // Header
    goToDashboard: 'الذهاب إلى لوحة التحكم',
    openMenu: 'فتح القائمة',
    
    // LevelPage
    video: 'فيديو',
    noVideo: 'لا يوجد فيديو',
    noPdfAvailable: 'لا يوجد PDF متاح',
    selectOtherLanguage: 'اختر لغة أخرى',
    openPdf: 'فتح PDF',
    play: 'تشغيل',
    pause: 'إيقاف',
    enlargeVideo: 'تكبير الفيديو',
    previousLesson: 'الدرس السابق',
    nextLesson: 'الدرس التالي',
    quickActions: 'الإجراءات السريعة',
    print: 'طباعة',
    copyLink: 'نسخ الرابط',
    
    // Recherche
    search: 'بحث'
  }
};

export const useTranslation = () => {
  const { language } = useContext(LanguageContext);
  
  const t = (key) => {
    const currentTranslations = translations[language] || translations.fr;
    return currentTranslations[key] || key;
  };
  
  return { t, language };
};

export default useTranslation;
