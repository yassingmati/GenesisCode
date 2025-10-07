:: =================================================================
:: == CREATION DE L'ARBORESCENCE POUR LA PLATEFORME EDUCATIVE
:: =================================================================

:: Crée le dossier principal du projet
md frontend

:: -----------------------------------------------------------------
:: -- Dossiers de base à la racine de /src
:: -----------------------------------------------------------------
md frontend\src\assets\styles
md frontend\src\assets\icons
md frontend\src\assets\images
md frontend\src\components
md frontend\src\contexts
md frontend\src\hooks
md frontend\src\pages
md frontend\src\services
md frontend\src\utils
md frontend\src\admin

:: -----------------------------------------------------------------
:: -- Structure détaillée du dossier /components
:: -----------------------------------------------------------------
md frontend\src\components\auth
md frontend\src\components\common
md frontend\src\components\dashboard
md frontend\src\components\gamification
md frontend\src\components\layout
md frontend\src\components\learning

:: -----------------------------------------------------------------
:: -- Structure détaillée du dossier /pages
:: -----------------------------------------------------------------
md frontend\src\pages\auth
md frontend\src\pages\course
md frontend\src\pages\dashboard
md frontend\src\pages\community

:: -----------------------------------------------------------------
:: -- Structure détaillée du dossier /admin
:: -----------------------------------------------------------------
md frontend\src\admin\pages
md frontend\src\admin\components

:: =================================================================
:: == CREATION DES FICHIERS DU PROJET
:: =================================================================

:: -- Fichiers à la racine
type nul > frontend\package.json
type nul > frontend\tailwind.config.js
type nul > frontend\.env
type nul > frontend\.gitignore

:: -- Fichiers principaux de /src
type nul > frontend\src\App.jsx
type nul > frontend\src\AppRouter.jsx
type nul > frontend\src\firebaseConfig.js
type nul > frontend\src\assets\styles\main.css

:: -- Fichiers pour les services et les hooks
type nul > frontend\src\services\authService.js
type nul > frontend\src\services\courseService.js
type nul > frontend\src\services\userService.js
type nul > frontend\src\hooks\useAuth.js
type nul > frontend\src\hooks\useCourse.js

:: -- Fichiers pour les contexts
type nul > frontend\src\contexts\AuthContext.jsx
type nul > frontend\src\contexts\CourseContext.jsx
type nul > frontend\src\contexts\ThemeContext.jsx

:: -- Fichiers pour les pages principales
type nul > frontend\src\pages\Home.jsx
type nul > frontend\src\pages\Pricing.jsx
type nul > frontend\src\pages\auth\Login.jsx
type nul > frontend\src\pages\auth\Register.jsx
type nul > frontend\src\pages\course\CourseList.jsx
type nul > frontend\src\pages\course\CourseDetail.jsx
type nul > frontend\src\pages\dashboard\StudentDashboard.jsx
type nul > frontend\src\pages\dashboard\ParentDashboard.jsx
type nul > frontend\src\pages\dashboard\TeacherDashboard.jsx
type nul > frontend\src\pages\community\Forum.jsx
type nul > frontend\src\pages\community\Leaderboard.jsx
type nul > frontend\src\pages\community\Challenges.jsx
type nul > frontend\src\pages\UserProfile.jsx

:: -- Fichiers pour les composants réutilisables
type nul > frontend\src\components\layout\Header.jsx
type nul > frontend\src\components\layout\Footer.jsx
type nul > frontend\src\components\layout\Sidebar.jsx
type nul > frontend\src\components\common\Button.jsx
type nul > frontend\src\components\common\Modal.jsx
type nul > frontend\src\components\common\Spinner.jsx
type nul > frontend\src\components\common\ProtectedRoute.jsx
type nul > frontend\src\components\auth\SocialLoginButtons.jsx
type nul > frontend\src\components\gamification\Badge.jsx
type nul > frontend\src\components\gamification\ProgressBar.jsx
type nul > frontend\src\components\learning\Quiz.jsx
type nul > frontend\src\components\learning\Puzzle.jsx
type nul > frontend\src\components\learning\VideoPlayer.jsx
type nul > frontend\src\components\learning\CodeEditor.jsx

:: -- Fichiers pour la section Admin
type nul > frontend\src\admin\AdminLayout.jsx
type nul > frontend\src\admin\pages\AdminDashboard.jsx
type nul > frontend\src\admin\pages\UserManagement.jsx
type nul > frontend\src\admin\pages\CourseManagement.jsx
type nul > frontend\src\admin\pages\ContentManagement.jsx
type nul > frontend\src\admin\pages\PaymentManagement.jsx

:: Affiche un message de succès
echo Arborescence du projet React creee avec succes selon votre document de conception !
