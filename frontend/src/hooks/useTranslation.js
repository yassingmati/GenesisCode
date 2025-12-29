import { useContext, useCallback } from 'react';
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
    courses: {
      label: 'Cours',
      title: 'Parcours d\'apprentissage',
      subtitle: 'Explorez nos parcours classiques et progressez étape par étape.'
    },
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
    footer: {
      allRightsReserved: 'Tous droits réservés',
      description: 'La plateforme d\'apprentissage du code préférée des futurs génies de la tech.',
      platform: {
        title: 'Plateforme',
        courses: 'Cours',
        pricing: 'Tarifs',
        security: 'Sécurité'
      },
      resources: {
        title: 'Ressources',
        blog: 'Blog',
        help: 'Centre d\'aide',
        parents: 'Guide Parents'
      },
      legal: {
        title: 'Légal',
        terms: 'Conditions d\'utilisation',
        privacy: 'Confidentialité',
        cookies: 'Cookies'
      }
    },

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

    search: 'Rechercher',

    // Home Page
    home: {
      hero: {
        badge: '🚀 La plateforme n°1 pour apprendre à coder',
        title: 'Deviens le héros de ton propre code !',
        subtitle: 'Tu as entre 8 et 17 ans et tu rêves de créer tes propres jeux ou sites web ? CodeGenesis t\'accompagne dans une aventure numérique unique. Apprends à coder en t\'amusant avec nos tutoriels vidéo, gagne des badges d\'expert et grimpe dans le classement mondial. L\'aventure commence ici !',
        tryFree: 'Essayer gratuitement',
        viewDemo: 'Voir la démo'
      },
      features: {
        title: 'Pourquoi choisir CodeGenesis ?',
        subtitle: 'Une approche pédagogique unique qui combine théorie, pratique et gamification pour un apprentissage efficace.'
      },
      scenarios: {
        title: 'Une expérience pour chacun',
        subtitle: 'Que vous soyez élève, parent ou administrateur, CodeGenesis offre des outils adaptés à vos besoins.'
      },
      levels: {
        title: 'Niveaux de progression',
        subtitle: 'Un parcours structuré pour accompagner votre enfant de ses premières lignes de code jusqu\'à la maîtrise.'
      },
      testimonials: {
        title: 'Ce qu\'ils en disent'
      },
      faq: {
        title: 'Questions Fréquentes'
      },
      contact: {
        title: 'Encore des questions ?',
        subtitle: 'Notre équipe est là pour vous aider. Contactez-nous et nous vous répondrons sous 24h.',
        name: 'Nom',
        email: 'Email',
        message: 'Message',
        send: 'Envoyer le message'
      },
      heroFeatures: ['Progression adaptée', 'Certificats reconnus', 'Suivi parental'],
      featuresList: {
        interactive: { title: "Apprentissage Interactif", desc: "Éditeur de code intégré pour pratiquer directement dans le navigateur sans installation." },
        gamification: { title: "Gamification", desc: "Gagnez des badges, montez en niveau et débloquez des récompenses pour rester motivé." },
        secure: { title: "Environnement Sécurisé", desc: "Un espace modéré et sécurisé, adapté aux mineurs, sans publicité ni distractions." },
        adapted: { title: "Parcours Adaptés", desc: "Des cursus progressifs du débutant à l'expert, adaptés à chaque tranche d'âge." },
        projects: { title: "Projets Concrets", desc: "Créez de vrais sites web et jeux vidéo à partager avec vos amis et votre famille." },
        parental: { title: "Suivi Parental", desc: "Tableau de bord détaillé pour suivre les progrès et gérer le temps d'écran." }
      },
      scenariosList: {
        student: {
          title: "Pour les Élèves",
          subtitle: "Apprendre en s'amusant",
          features: ["Accès à tous les cours et exercices", "Éditeur de code en temps réel", "Défis quotidiens et récompenses", "Création de portfolio de projets"],
          action: "Commencer l'aventure"
        },
        parent: {
          title: "Pour les Parents",
          subtitle: "Suivre et encourager",
          features: ["Tableau de bord de progression détaillé", "Gestion du temps d'écran et des accès", "Rapports d'activité hebdomadaires", "Gestion des abonnements simplifiée"],
          action: "Créer un compte parent"
        }
      },
      levelsList: {
        beginner: { title: "Débutant", steps: ["Logique de programmation", "Premiers pas avec Scratch", "Introduction au HTML/CSS"] },
        intermediate: { title: "Intermédiaire", steps: ["Javascript interactif", "Création de mini-jeux", "Design responsive"] },
        advanced: { title: "Avancé", steps: ["Frameworks modernes (React)", "Bases de données", "Projets complets"] }
      },
      testimonialsList: [
        { name: "Thomas, 12 ans", role: "Élève", text: "J'ai créé mon propre site web pour mon club de foot. C'était super facile avec les vidéos !" },
        { name: "Sophie, Maman", role: "Parent", text: "Enfin une activité écran intelligente. Je peux suivre ses progrès et il est vraiment passionné." },
        { name: "Marc, Professeur", role: "Éducateur", text: "Une plateforme pédagogique très bien pensée qui rend la programmation accessible à tous." }
      ],
      faqList: [
        { q: "À quel âge peut-on commencer ?", a: "CodeGenesis est conçu pour les enfants de 8 à 17 ans, avec des parcours adaptés à chaque tranche d'âge." },
        { q: "Faut-il installer un logiciel ?", a: "Non, tout se passe dans le navigateur web. Une connexion internet suffit." },
        { q: "Est-ce sécurisé ?", a: "Oui, la sécurité est notre priorité. Pas de publicité, pas de liens externes non modérés, et les données sont protégées." },
        { q: "Puis-je annuler l'abonnement ?", a: "Oui, l'abonnement est sans engagement et peut être annulé à tout moment depuis l'espace parent." }
      ]
    },

    // Auth Pages
    auth: {
      login: {
        welcome: 'Bon retour !',
        subtitle: 'Connectez-vous pour continuer votre apprentissage',
        action: 'Se connecter',
        google: 'Se connecter avec Google',
        noAccount: 'Vous n\'avez pas de compte ?',
        link: 'S\'inscrire'
      },
      register: {
        welcome: 'Créer un compte',
        subtitle: 'Rejoignez la communauté et commencez à apprendre',
        action: 'Créer un compte',
        google: 'S\'inscrire avec Google',
        hasAccount: 'Vous avez déjà un compte ?',
        link: 'Se connecter'
      },
      email: 'Adresse email',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      iAm: 'Je suis :',
      student: 'Étudiant',
      parent: 'Parent',
      rememberMe: 'Se souvenir de moi',
      forgotPassword: 'Mot de passe oublié ?',
      orContinueWith: 'Ou continuer avec',
      terms: 'Conditions',
      privacy: 'Politique de confidentialité',
      backToHome: 'Retour à l\'accueil',
      agree: 'En continuant, vous acceptez nos',
      hero: {
        title: 'Apprenez le code\nsans limites.',
        subtitle: 'Rejoignez une communauté passionnée et maîtrisez les technologies de demain grâce à notre plateforme interactive.',
        progress: {
          title: 'Progression rapide',
          subtitle: 'Parcours adaptés à votre niveau'
        },
        certificates: {
          title: 'Certificats reconnus',
          subtitle: 'Validez vos compétences'
        }
      },
      forgotPasswordPage: {
        title: 'Mot de passe oublié',
        subtitle: 'Entrez votre adresse email pour recevoir un lien de réinitialisation',
        emailPlaceholder: 'Adresse email',
        submitButton: 'Envoyer le lien',
        successTitle: 'Email envoyé!',
        successMessage: 'Si un compte avec cet email existe, un lien de réinitialisation a été envoyé.',
        checkSpam: 'Vérifiez votre boîte de réception et votre dossier spam. Le lien expirera dans 1 heure.',
        backToLogin: 'Retour à la connexion'
      },
      errors: {
        emailInUse: "Cette adresse email est déjà utilisée.",
        userNotFound: "Aucun compte associé à cet email.",
        wrongPassword: "Mot de passe incorrect.",
        accountDisabled: "Ce compte a été désactivé.",
        missingFields: "Email et mot de passe requis.",
        incorrectCredentials: "Email ou mot de passe incorrect.",
        weakPassword: "Le mot de passe doit contenir au moins 6 caractères.",
        matchPassword: "Les mots de passe ne correspondent pas.",
        invalidEmail: "Format d'email invalide.",
        default: "Une erreur est survenue."
      }
    },

    // Dashboard
    dashboard: {
      welcome: 'Bienvenue',
      welcomeMessage: 'Avant de commencer, dis-nous comment tu préfères apprendre :',
      startAdventure: 'Fais ton choix pour commencer l\'aventure !',
      chooseLanguage: 'Choisir ton propre langage',
      chooseLanguageDesc: 'Sélectionne librement le langage que tu souhaites maîtriser',
      followPath: 'Suivre le parcours GenesisCode',
      followPathDesc: 'Laisse-toi guider par notre programme structuré',
      stats: {
        title: 'Statistiques du jour',
        pomodoros: 'Pomodoros complétés',
        dailyGoal: 'Objectif quotidien',
        completed: 'Complété'
      },
      tasks: {
        title: 'Tâches récentes',
        viewAll: 'Voir tout'
      },
      subscription: {
        title: 'Débloquez votre potentiel',
        subtitle: 'Accédez à tous les parcours et débloquez votre potentiel de programmation avec nos outils premium.',
        unlimited: 'Accès illimité',
        personalized: 'Parcours personnalisés',
        progress: 'Suivi des progrès'
      }
    },

    // Parent Dashboard
    parent: {
      dashboard: 'Tableau de bord',
      subtitle: 'Gérez les activités et les paiements de vos enfants.',
      inviteChild: 'Inviter un enfant',
      logout: 'Déconnexion',
      myChildren: 'Mes Enfants',
      noChildren: 'Aucun enfant associé.',
      pending: 'En attente',
      tabs: {
        tasks: 'Gestion des Tâches',
        payments: 'Paiements & Abonnements'
      }
    },

    // Pomodoro
    pomodoro: {
      focus: 'Temps de concentration',
      break: 'Pause',
      shortBreak: 'Pause courte',
      longBreak: 'Pause longue'
    },

    // Navbar & Profile
    nav: {
      home: 'Accueil',
      contact: 'Contact',
      profile: 'Profil',
      logout: 'Déconnexion'
    },

    categoryPlans: {
      unlockPotential: 'Débloquez votre',
      potential: 'Potentiel',
      choosePlan: 'Choisissez le plan parfait pour accéder à des parcours de formation complets et transformez vos compétences.',
      immediateUnlock: 'Déblocage Immédiat',
      completePaths: 'Parcours Complets',
      securePayment: 'Paiement Sécurisé',
      loading: 'Chargement des meilleures offres...',
      error: 'Oups, une erreur est survenue',
      retry: 'Réessayer',
      noPlans: 'Aucun plan disponible pour cette catégorie.',
      exploreOthers: 'Explorer d\'autres cours',
      backToDashboard: 'Retour au tableau de bord',
      popular: 'POPULAIRE',
      free: 'Gratuit',
      buyNow: 'Acheter maintenant',
      processing: 'Traitement...',
      noFeatures: 'Aucune fonctionnalité listée',
      alreadyHasAccess: 'Vous avez déjà accès à ce plan !',
      freeAccessGranted: 'Accès gratuit accordé !',
      redirecting: 'Redirection vers le paiement...'
    },

    specificPaths: {
      roadmap: 'Feuille de Route',
      followPath: 'Suivez le chemin recommandé pour maîtriser {{category}}, du débutant à l\'expert.',
      unlockedAccess: 'Accès Débloqué',
      construction: 'Construction en cours',
      constructionDesc: 'Les ingénieurs tracent encore les routes pour {{category}}. Revenez bientôt !',
      chooseOther: 'Choisir une autre destination',
      unlockTrack: 'Débloquer ce parcours',
      step: 'Étape',
      start: 'Commencer',
      locked: 'Verrouillé',
      backToLanguages: 'Retour aux langages',
      lockedContent: 'Contenu Verrouillé',
      lockedDesc: 'Débloque ce parcours pour accéder à tous les niveaux',
      viewLevels: 'Voir les niveaux',
      unlockViaSub: 'Débloquer via l\'abonnement'
    }
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
    courses: {
      label: 'Courses',
      title: 'Learning Paths',
      subtitle: 'Explore our classic paths and progress step by step.'
    },
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
    footer: {
      allRightsReserved: 'All rights reserved',
      description: 'The favorite coding learning platform for future tech geniuses.',
      platform: {
        title: 'Platform',
        courses: 'Courses',
        pricing: 'Pricing',
        security: 'Security'
      },
      resources: {
        title: 'Resources',
        blog: 'Blog',
        help: 'Help Center',
        parents: 'Parents Guide'
      },
      legal: {
        title: 'Legal',
        terms: 'Terms of Use',
        privacy: 'Privacy',
        cookies: 'Cookies'
      }
    },

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

    search: 'Search',

    // Home Page
    home: {
      hero: {
        badge: '🚀 The #1 platform to learn coding',
        title: 'Become the Hero of Your Own Code!',
        subtitle: 'Are you between 8 and 17 years old and dream of creating your own games or websites? CodeGenesis guides you on a unique digital adventure. Learn to code while having fun with our video tutorials, earn expert badges, and climb the global leaderboard. The adventure starts here!',
        tryFree: 'Try for free',
        viewDemo: 'View demo'
      },
      features: {
        title: 'Why choose CodeGenesis?',
        subtitle: 'A unique pedagogical approach that combines theory, practice and gamification for effective learning.'
      },
      scenarios: {
        title: 'An experience for everyone',
        subtitle: 'Whether you are a student, parent or administrator, CodeGenesis offers tools adapted to your needs.'
      },
      levels: {
        title: 'Progression levels',
        subtitle: 'A structured path to accompany your child from their first lines of code to mastery.'
      },
      testimonials: {
        title: 'What they say'
      },
      faq: {
        title: 'Frequently Asked Questions'
      },
      contact: {
        title: 'Still have questions?',
        subtitle: 'Our team is here to help. Contact us and we will answer within 24h.',
        name: 'Name',
        email: 'Email',
        message: 'Message',
        send: 'Send message'
      },
      heroFeatures: ['Adapted progression', 'Recognized certificates', 'Parental monitoring'],
      featuresList: {
        interactive: { title: "Interactive Learning", desc: "Integrated code editor to practice directly in the browser without installation." },
        gamification: { title: "Gamification", desc: "Earn badges, level up and unlock rewards to stay motivated." },
        secure: { title: "Secure Environment", desc: "A moderated and secure space, adapted for minors, without ads or distractions." },
        adapted: { title: "Adapted Paths", desc: "Progressive courses from beginner to expert, adapted to each age group." },
        projects: { title: "Concrete Projects", desc: "Create real websites and video games to share with friends and family." },
        parental: { title: "Parental Monitoring", desc: "Detailed dashboard to track progress and manage screen time." }
      },
      scenariosList: {
        student: {
          title: "For Students",
          subtitle: "Learn while having fun",
          features: ["Access to all courses and exercises", "Real-time code editor", "Daily challenges and rewards", "Project portfolio creation"],
          action: "Start the adventure"
        },
        parent: {
          title: "For Parents",
          subtitle: "Follow and encourage",
          features: ["Detailed progress dashboard", "Screen time and access management", "Weekly activity reports", "Simplified subscription management"],
          action: "Create parent account"
        }
      },
      levelsList: {
        beginner: { title: "Beginner", steps: ["Programming logic", "First steps with Scratch", "Introduction to HTML/CSS"] },
        intermediate: { title: "Intermediate", steps: ["Interactive Javascript", "Mini-game creation", "Responsive design"] },
        advanced: { title: "Advanced", steps: ["Modern frameworks (React)", "Databases", "Complete projects"] }
      },
      testimonialsList: [
        { name: "Thomas, 12 years old", role: "Student", text: "I created my own website for my football club. It was super easy with the videos!" },
        { name: "Sophie, Mom", role: "Parent", text: "Finally a smart screen activity. I can follow his progress and he is really passionate." },
        { name: "Marc, Teacher", role: "Educator", text: "A very well thought out educational platform that makes programming accessible to everyone." }
      ],
      faqList: [
        { q: "At what age can we start?", a: "CodeGenesis is designed for children from 8 to 17 years old, with paths adapted to each age group." },
        { q: "Do I need to install software?", a: "No, everything happens in the web browser. An internet connection is enough." },
        { q: "Is it secure?", a: "Yes, security is our priority. No ads, no unmoderated external links, and data is protected." },
        { q: "Can I cancel the subscription?", a: "Yes, the subscription is non-binding and can be cancelled at any time from the parent area." }
      ]
    },

    // Auth Pages
    auth: {
      login: {
        welcome: 'Welcome back!',
        subtitle: 'Log in to continue your learning',
        action: 'Log in',
        google: 'Log in with Google',
        noAccount: 'Don\'t have an account?',
        link: 'Sign up'
      },
      register: {
        welcome: 'Create an account',
        subtitle: 'Join the community and start learning',
        action: 'Create an account',
        google: 'Sign up with Google',
        hasAccount: 'Already have an account?',
        link: 'Log in'
      },
      email: 'Email address',
      password: 'Password',
      confirmPassword: 'Confirm password',
      iAm: 'I am:',
      student: 'Student',
      parent: 'Parent',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      orContinueWith: 'Or continue with',
      terms: 'Terms',
      privacy: 'Privacy Policy',
      backToHome: 'Back to home',
      agree: 'By continuing, you agree to our',
      hero: {
        title: 'Learn to code\nwithout limits.',
        subtitle: 'Join a passionate community and master tomorrow\'s technologies with our interactive platform.',
        progress: {
          title: 'Rapid Progress',
          subtitle: 'Paths adapted to your level'
        },
        certificates: {
          title: 'Recognized Certificates',
          subtitle: 'Validate your skills'
        }
      },
      forgotPasswordPage: {
        title: 'Forgot Password',
        subtitle: 'Enter your email address to receive a reset link',
        emailPlaceholder: 'Email address',
        submitButton: 'Send link',
        successTitle: 'Email sent!',
        successMessage: 'If an account with this email exists, a reset link has been sent.',
        checkSpam: 'Check your inbox and spam folder. The link will expire in 1 hour.',
        backToLogin: 'Back to login'
      },
      errors: {
        emailInUse: "This email is already in use.",
        userNotFound: "No account is associated with this email.",
        wrongPassword: "Incorrect password.",
        accountDisabled: "This account has been disabled.",
        missingFields: "Email and password are required.",
        incorrectCredentials: "Incorrect email or password.",
        weakPassword: "Password must be at least 6 characters long.",
        matchPassword: "Passwords do not match.",
        invalidEmail: "Invalid email format.",
        default: "An error occurred."
      }
    },

    // Dashboard
    dashboard: {
      welcome: 'Welcome',
      welcomeMessage: 'Before we start, tell us how you prefer to learn:',
      startAdventure: 'Make your choice to start the adventure!',
      chooseLanguage: 'Choose your own language',
      chooseLanguageDesc: 'Freely select the language you want to master',
      followPath: 'Follow the GenesisCode path',
      followPathDesc: 'Let yourself be guided by our structured program',
      stats: {
        title: 'Daily Statistics',
        pomodoros: 'Completed Pomodoros',
        dailyGoal: 'Daily Goal',
        completed: 'Completed'
      },
      tasks: {
        title: 'Recent Tasks',
        viewAll: 'View All'
      },
      subscription: {
        title: 'Unlock your potential',
        subtitle: 'Access all paths and unlock your programming potential with our premium tools.',
        unlimited: 'Unlimited Access',
        personalized: 'Personalized Paths',
        progress: 'Progress Tracking'
      }
    },

    // Parent Dashboard
    parent: {
      dashboard: 'Dashboard',
      subtitle: 'Manage your children\'s activities and payments.',
      inviteChild: 'Invite a child',
      logout: 'Logout',
      myChildren: 'My Children',
      noChildren: 'No child associated.',
      pending: 'Pending',
      tabs: {
        tasks: 'Task Management',
        payments: 'Payments & Subscriptions'
      }
    },

    // Pomodoro
    pomodoro: {
      focus: 'Focus Time',
      break: 'Break',
      shortBreak: 'Short Break',
      longBreak: 'Long Break'
    },

    // Navbar & Profile
    nav: {
      home: 'Home',
      contact: 'Contact',
      profile: 'Profile',
      logout: 'Logout'
    },

    categoryPlans: {
      unlockPotential: 'Unlock your',
      potential: 'Potential',
      choosePlan: 'Choose the perfect plan to access complete training paths and transform your skills.',
      immediateUnlock: 'Immediate Unlock',
      completePaths: 'Complete Paths',
      securePayment: 'Secure Payment',
      loading: 'Loading best offers...',
      error: 'Oops, something went wrong',
      retry: 'Retry',
      noPlans: 'No plans available for this category.',
      exploreOthers: 'Explore other courses',
      backToDashboard: 'Back to dashboard',
      popular: 'POPULAR',
      free: 'Free',
      buyNow: 'Buy Now',
      processing: 'Processing...',
      noFeatures: 'No features listed',
      alreadyHasAccess: 'You already have access to this plan!',
      freeAccessGranted: 'Free access granted!',
      redirecting: 'Redirecting to payment...'
    },

    specificPaths: {
      roadmap: 'Roadmap',
      followPath: 'Follow the recommended path to master {{category}}, from beginner to expert.',
      unlockedAccess: 'Access Unlocked',
      construction: 'Under Construction',
      constructionDesc: 'Engineers are still plotting the routes for {{category}}. Come back soon!',
      chooseOther: 'Choose another destination',
      unlockTrack: 'Unlock this path',
      step: 'Step',
      start: 'Start',
      locked: 'Locked',
      backToLanguages: 'Back to languages',
      lockedContent: 'Locked Content',
      lockedDesc: 'Unlock this path to access all levels',
      viewLevels: 'View levels',
      unlockViaSub: 'Unlock via subscription'
    }
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
    courses: {
      label: 'الدورات',
      title: 'مسارات التعلم',
      subtitle: 'استكشف مساراتنا الكلاسيكية وتقدم خطوة بخطوة.'
    },
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
    footer: {
      allRightsReserved: 'جميع الحقوق محفوظة',
      description: 'منصة تعلم البرمجة المفضلة لعباقرة التكنولوجيا في المستقبل.',
      platform: {
        title: 'المنصة',
        courses: 'الدورات',
        pricing: 'الأسعار',
        security: 'الأمان'
      },
      resources: {
        title: 'الموارد',
        blog: 'المدونة',
        help: 'مركز المساعدة',
        parents: 'دليل الآباء'
      },
      legal: {
        title: 'قانوني',
        terms: 'شروط الاستخدام',
        privacy: 'الخصوصية',
        cookies: 'ملفات تعريف الارتباط'
      }
    },

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

    search: 'بحث',

    // Home Page
    home: {
      hero: {
        badge: '🚀 المنصة رقم 1 لتعلم البرمجة',
        title: 'كن بطل كودك الخاص!',
        subtitle: 'هل عمرك بين 8 و17 عاماً وتحلم بإنشاء ألعابك أو مواقعك الإلكترونية الخاصة؟ CodeGenesis ترافقك في مغامرة رقمية فريدة. تعلم البرمجة بالمرح مع دروسنا المصورة، اربح شارات الخبراء وارتق في الترتيب العالمي. المغامرة تبدأ هنا!',
        tryFree: 'جرب مجانًا',
        viewDemo: 'شاهد العرض التوضيحي'
      },
      features: {
        title: 'لماذا تختار CodeGenesis؟',
        subtitle: 'نهج تربوي فريد يجمع بين النظرية والممارسة والألعاب للتعلم الفعال.'
      },
      scenarios: {
        title: 'تجربة للجميع',
        subtitle: 'سواء كنت طالبًا أو ولي أمر أو مسؤولًا، تقدم CodeGenesis أدوات تتكيف مع احتياجاتك.'
      },
      levels: {
        title: 'مستويات التقدم',
        subtitle: 'مسار منظم لمرافقة طفلك من أولى سطور البرمجة حتى الإتقان.'
      },
      testimonials: {
        title: 'ماذا يقولون'
      },
      faq: {
        title: 'أسئلة شائعة'
      },
      contact: {
        title: 'هل لديك أسئلة أخرى؟',
        subtitle: 'فريقنا هنا للمساعدة. اتصل بنا وسنرد في غضون 24 ساعة.',
        name: 'الاسم',
        email: 'البريد الإلكتروني',
        message: 'الرسالة',
        send: 'إرسال الرسالة'
      },
      heroFeatures: ['تقدم متكيف', 'شهادات معترف بها', 'متابعة أبوية'],
      featuresList: {
        interactive: { title: "التعلم التفاعلي", desc: "محرر أكواد مدمج للممارسة مباشرة في المتصفح دون تثبيت." },
        gamification: { title: "التلعيب", desc: "اربح الشارات، وارتق في المستوى وافتح المكافآت لتبقى متحفزًا." },
        secure: { title: "بيئة آمنة", desc: "مساحة خاضعة للإشراف وآمنة، مناسبة للقاصرين، بدون إعلانات أو مشتتات." },
        adapted: { title: "مسارات متكيفة", desc: "دورات تدريجية من المبتدئ إلى الخبير، مناسبة لكل فئة عمرية." },
        projects: { title: "مشاريع ملموسة", desc: "أنشئ مواقع ويب وألعاب فيديو حقيقية لمشاركتها مع الأصدقاء والعائلة." },
        parental: { title: "المتابعة الأبوية", desc: "لوحة تحكم مفصلة لتتبع التقدم وإدارة وقت الشاشة." }
      },
      scenariosList: {
        student: {
          title: "للطلاب",
          subtitle: "تعلم واستمتع",
          features: ["الوصول إلى جميع الدورات والتمارين", "محرر أكواد في الوقت الفعلي", "تحديات يومية ومكافآت", "إنشاء ملف مشاريع"],
          action: "ابدأ المغامرة"
        },
        parent: {
          title: "للأولياء",
          subtitle: "تابع وشجع",
          features: ["لوحة تحكم تفصيلية للتقدم", "إدارة وقت الشاشة والوصول", "تقارير النشاط الأسبوعية", "إدارة الاشتراكات المبسطة"],
          action: "إنشاء حساب ولي أمر"
        }
      },
      levelsList: {
        beginner: { title: "مبتدئ", steps: ["منطق البرمجة", "الخطوات الأولى مع Scratch", "مقدمة في HTML/CSS"] },
        intermediate: { title: "متوسط", steps: ["جافا سكريبت التفاعلي", "إنشاء ألعاب مصغرة", "تصميم متجاوب"] },
        advanced: { title: "متقدم", steps: ["أطر عمل حديثة (React)", "قواعد البيانات", "مشاريع كاملة"] }
      },
      testimonialsList: [
        { name: "توماس، 12 سنة", role: "طالب", text: "أنشأت موقع الويب الخاص بي لنادي كرة القدم. كان الأمر سهلاً للغاية مع مقاطع الفيديو!" },
        { name: "صوفي، أم", role: "ولي أمر", text: "أخيرًا نشاط شاشة ذكي. يمكنني متابعة تقدمه وهو شغوف حقًا." },
        { name: "مارك، معلم", role: "مربي", text: "منصة تعليمية مدروسة جيدًا تجعل البرمجة في متناول الجميع." }
      ],
      faqList: [
        { q: "في أي عمر يمكن البدء؟", a: "تم تصميم CodeGenesis للأطفال من سن 8 إلى 17 عامًا، مع مسارات مناسبة لكل فئة عمرية." },
        { q: "هل يجب تثبيت برنامج؟", a: "لا، كل شيء يحدث في متصفح الويب. اتصال بالإنترنت يكفي." },
        { q: "هل هو آمن؟", a: "نعم، الأمان هو أولويتنا. لا إعلانات، لا روابط خارجية غير خاضعة للإشراف، والبيانات محمية." },
        { q: "هل يمكنني إلغاء الاشتراك؟", a: "نعم، الاشتراك غير ملزم ويمكن إلغاؤه في أي وقت من منطقة الوالدين." }
      ]
    },

    // Auth Pages
    auth: {
      login: {
        welcome: 'مرحبًا بعودتك!',
        subtitle: 'سجل الدخول لمواصلة تعلمك',
        action: 'تسجيل الدخول',
        google: 'تسجيل الدخول باستخدام Google',
        noAccount: 'ليس لديك حساب؟',
        link: 'اشتراك'
      },
      register: {
        welcome: 'إنشاء حساب',
        subtitle: 'انضم إلى المجتمع وابدأ التعلم',
        action: 'إنشاء حساب',
        google: 'التسجيل باستخدام Google',
        hasAccount: 'لديك حساب بالفعل؟',
        link: 'تسجيل الدخول'
      },
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      iAm: 'أنا:',
      student: 'طالب',
      parent: 'ولي أمر',
      rememberMe: 'تذكرني',
      forgotPassword: 'هل نسيت كلمة المرور؟',
      orContinueWith: 'أو الاستمرار مع',
      terms: 'الشروط',
      privacy: 'سياسة الخصوصية',
      backToHome: 'العودة إلى الصفحة الرئيسية',
      agree: 'من خلال الاستمرار، فإنك توافق على',
      hero: {
        title: 'تعلم البرمجة\nبلا حدود.',
        subtitle: 'انضم إلى مجتمع شغوف وأتقن تقنيات الغد بفضل منصتنا التفاعلية.',
        progress: {
          title: 'تقدم سريع',
          subtitle: 'مسارات مكيفة لمستواك'
        },
        certificates: {
          title: 'شهادات معترف بها',
          subtitle: 'تحقق من مهاراتك'
        }
      },
      forgotPasswordPage: {
        title: 'نسيت كلمة المرور',
        subtitle: 'أدخل عنوان بريدك الإلكتروني لتلقي رابط إعادة التعيين',
        emailPlaceholder: 'البريد الإلكتروني',
        submitButton: 'إرسال الرابط',
        successTitle: 'تم إرسال البريد الإلكتروني!',
        successMessage: 'إذا كان هناك حساب بهذا البريد الإلكتروني، فقد تم إرسال رابط إعادة التعيين.',
        checkSpam: 'تحقق من صندوق الوارد ومجلد الرسائل غير المرغوب فيها. ستنتهي صلاحية الرابط خلال ساعة واحدة.',
        backToLogin: 'العودة إلى تسجيل الدخول'
      }
    },

    // Dashboard
    dashboard: {
      welcome: 'مرحباً',
      welcomeMessage: 'قبل أن نبدأ، أخبرنا كيف تفضل التعلم:',
      startAdventure: 'اتخذ اختيارك لبدء المغامرة!',
      chooseLanguage: 'اختر لغتك الخاصة',
      chooseLanguageDesc: 'اختر بحرية اللغة التي تريد إتقانها',
      followPath: 'اتبع مسار GenesisCode',
      followPathDesc: 'دع نفسك تقود بواسطة برنامجنا المنظم',
      stats: {
        title: 'إحصائيات اليوم',
        pomodoros: 'بومودورو المكتملة',
        dailyGoal: 'الهدف اليومي',
        completed: 'مكتمل'
      },
      tasks: {
        title: 'المهام الأخيرة',
        viewAll: 'عرض الكل'
      },
      subscription: {
        title: 'أطلق العنان لإمكاناتك',
        subtitle: 'قم بالوصول إلى جميع المسارات وأطلق العنان لإمكاناتك البرمجية باستخدام أدواتنا المتميزة.',
        unlimited: 'وصول غير محدود',
        personalized: 'مسارات مخصصة',
        progress: 'تتبع التقدم'
      }
    },

    // Parent Dashboard
    parent: {
      dashboard: 'لوحة التحكم',
      subtitle: 'إدارة أنشطة ومدفوعات أطفالك.',
      inviteChild: 'دعوة طفل',
      logout: 'تسجيل الخروج',
      myChildren: 'أطفالي',
      noChildren: 'لا يوجد طفل مرتبط.',
      pending: 'قيد الانتظار',
      tabs: {
        tasks: 'إدارة المهام',
        payments: 'المدفوعات والاشتراكات'
      }
    },

    // Pomodoro
    pomodoro: {
      focus: 'وقت التركيز',
      break: 'استراحة',
      shortBreak: 'استراحة قصيرة',
      longBreak: 'استراحة طويلة'
    },

    // Navbar & Profile
    nav: {
      home: 'الرئيسية',
      contact: 'اتصل بنا',
      profile: 'الملف الشخصي',
      logout: 'تسجيل الخروج'
    },

    categoryPlans: {
      unlockPotential: 'أطلق العنان',
      potential: 'لإمكاناتك',
      choosePlan: 'اختر الخطة المثالية للوصول إلى مسارات تدريب كاملة وتحويل مهاراتك.',
      immediateUnlock: 'فتح فوري',
      completePaths: 'مسارات كاملة',
      securePayment: 'دفع آمن',
      loading: 'تحميل أفضل العروض...',
      error: 'عفوا، حدث خطأ ما',
      retry: 'إعادة المحاولة',
      noPlans: 'لا توجد خطط متاحة لهذا الفئة.',
      exploreOthers: 'استكشاف دورات أخرى',
      backToDashboard: 'العودة إلى لوحة التحكم',
      popular: 'شائع',
      free: 'مجاني',
      buyNow: 'شراء الآن',
      processing: 'معالجة...',
      noFeatures: 'لا توجد ميزات مدرجة',
      alreadyHasAccess: 'لديك بالفعل حق الوصول إلى هذه الخطة!',
      freeAccessGranted: 'تم منح حق الوصول المجاني!',
      redirecting: 'إعادة التوجيه للدفع...'
    },

    specificPaths: {
      roadmap: 'خارطة الطريق',
      followPath: 'اتبع المسار الموصى به لإتقان {{category}}، من المبتدئ إلى الخبير.',
      unlockedAccess: 'تم فتح الوصول',
      construction: 'تحت الإنشاء',
      constructionDesc: 'لا يزال المهندسون يرسمون الطرق لـ {{category}}. عد قريبا!',
      chooseOther: 'اختر وجهة أخرى',
      unlockTrack: 'فتح هذا المسار',
      step: 'خطوة',
      start: 'بدء',
      locked: 'مغلق',
      backToLanguages: 'العودة إلى اللغات',
      lockedContent: 'محتوى مغلق',
      lockedDesc: 'افتح هذا المسار للوصول إلى جميع المستويات',
      viewLevels: 'عرض المستويات',
      unlockViaSub: 'فتح عبر الاشتراك'
    }
  }
};

const useTranslation = () => {
  const { language } = useContext(LanguageContext);

  const t = useCallback((key) => {
    const currentTranslations = translations[language] || translations.fr;

    // Support nested keys (e.g., 'home.hero.title')
    const keys = key.split('.');
    let value = currentTranslations;

    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        return key;
      }
    }

    return value;
  }, [language]);

  return { t, language };
};

export { useTranslation };
export default useTranslation;
