// Dashboard moderne et professionnel pour le client
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  FiTrendingUp, 
  FiBookOpen, 
  FiPlay, 
  FiCheckSquare, 
  FiClock,
  FiAward,
  FiUsers,
  FiTarget,
  FiCalendar,
  FiMessageSquare,
  FiStar,
  FiArrowRight,
  FiPlus,
  FiBarChart3,
  FiPieChart
} from 'react-icons/fi';
import './ModernDashboard.css';

const ModernDashboard = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    completedLessons: 0,
    totalLessons: 0,
    streak: 0,
    points: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Charger les données utilisateur
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Erreur parsing user data:', error);
      }
    }

    // Simuler le chargement des données
    const timer = setTimeout(() => {
      setIsLoading(false);
      setStats({
        completedLessons: 24,
        totalLessons: 50,
        streak: 7,
        points: 1250
      });
      setRecentActivity([
        { id: 1, type: 'lesson', title: 'JavaScript Avancé', time: '2h ago', status: 'completed' },
        { id: 2, type: 'exercise', title: 'Exercice React', time: '4h ago', status: 'completed' },
        { id: 3, type: 'quiz', title: 'Quiz Node.js', time: '1d ago', status: 'completed' },
        { id: 4, type: 'lesson', title: 'TypeScript Basics', time: '2d ago', status: 'in-progress' }
      ]);
      setRecommendedCourses([
        { id: 1, title: 'React Avancé', description: 'Maîtrisez les concepts avancés de React', progress: 65, difficulty: 'Intermédiaire' },
        { id: 2, title: 'Node.js & Express', description: 'Développement backend avec Node.js', progress: 30, difficulty: 'Débutant' },
        { id: 3, title: 'TypeScript', description: 'JavaScript typé pour des applications robustes', progress: 0, difficulty: 'Intermédiaire' }
      ]);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DashboardLoading />;
  }

  return (
    <div className="modern-dashboard">
      {/* Header de bienvenue */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="welcome-title">
            Bonjour {user?.firstName || 'Développeur'} ! 👋
          </h1>
          <p className="welcome-subtitle">
            Prêt à continuer votre apprentissage ? Voici votre progression.
          </p>
        </div>
        
        <div className="header-actions">
          <button className="action-btn primary">
            <FiPlus />
            Nouveau cours
          </button>
          <button className="action-btn secondary">
            <FiCalendar />
            Planifier
          </button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="stats-grid">
        <StatCard
          icon={FiBookOpen}
          title="Cours terminés"
          value={`${stats.completedLessons}/${stats.totalLessons}`}
          progress={(stats.completedLessons / stats.totalLessons) * 100}
          color="blue"
        />
        <StatCard
          icon={FiTarget}
          title="Série actuelle"
          value={`${stats.streak} jours`}
          subtitle="Continuez !"
          color="green"
        />
        <StatCard
          icon={FiAward}
          title="Points gagnés"
          value={stats.points.toLocaleString()}
          subtitle="+150 cette semaine"
          color="purple"
        />
        <StatCard
          icon={FiClock}
          title="Temps d'étude"
          value="12h 30m"
          subtitle="Cette semaine"
          color="orange"
        />
      </div>

      {/* Contenu principal */}
      <div className="dashboard-content">
        {/* Colonne gauche */}
        <div className="content-left">
          {/* Progression générale */}
          <div className="progress-section">
            <div className="section-header">
              <h2>Votre progression</h2>
              <button className="view-all-btn">
                Voir tout <FiArrowRight />
              </button>
            </div>
            
            <div className="progress-overview">
              <div className="progress-chart">
                <div className="chart-container">
                  <FiPieChart className="chart-icon" />
                  <div className="chart-content">
                    <div className="chart-percentage">48%</div>
                    <div className="chart-label">Complété</div>
                  </div>
                </div>
              </div>
              
              <div className="progress-details">
                <div className="progress-item">
                  <div className="progress-info">
                    <span className="progress-category">Débutant</span>
                    <span className="progress-value">15/20</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '75%' }}></div>
                  </div>
                </div>
                
                <div className="progress-item">
                  <div className="progress-info">
                    <span className="progress-category">Intermédiaire</span>
                    <span className="progress-value">8/15</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '53%' }}></div>
                  </div>
                </div>
                
                <div className="progress-item">
                  <div className="progress-info">
                    <span className="progress-category">Avancé</span>
                    <span className="progress-value">1/15</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '7%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cours recommandés */}
          <div className="courses-section">
            <div className="section-header">
              <h2>Cours recommandés</h2>
              <button className="view-all-btn">
                Voir tout <FiArrowRight />
              </button>
            </div>
            
            <div className="courses-grid">
              {recommendedCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </div>

        {/* Colonne droite */}
        <div className="content-right">
          {/* Activité récente */}
          <div className="activity-section">
            <div className="section-header">
              <h2>Activité récente</h2>
              <button className="view-all-btn">
                Voir tout <FiArrowRight />
              </button>
            </div>
            
            <div className="activity-list">
              {recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>

          {/* Objectifs */}
          <div className="goals-section">
            <div className="section-header">
              <h2>Objectifs de la semaine</h2>
            </div>
            
            <div className="goals-list">
              <GoalItem
                title="Terminer 3 leçons"
                progress={2}
                total={3}
                icon={FiBookOpen}
                color="blue"
              />
              <GoalItem
                title="Faire 5 exercices"
                progress={3}
                total={5}
                icon={FiCheckSquare}
                color="green"
              />
              <GoalItem
                title="Maintenir la série"
                progress={7}
                total={7}
                icon={FiTarget}
                color="purple"
              />
            </div>
          </div>

          {/* Communauté */}
          <div className="community-section">
            <div className="section-header">
              <h2>Communauté</h2>
            </div>
            
            <div className="community-stats">
              <div className="community-stat">
                <FiUsers className="stat-icon" />
                <div className="stat-content">
                  <div className="stat-value">2,847</div>
                  <div className="stat-label">Étudiants actifs</div>
                </div>
              </div>
              
              <div className="community-stat">
                <FiMessageSquare className="stat-icon" />
                <div className="stat-content">
                  <div className="stat-value">156</div>
                  <div className="stat-label">Messages aujourd'hui</div>
                </div>
              </div>
            </div>
            
            <button className="community-btn">
              <FiMessageSquare />
              Rejoindre la discussion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composants
const DashboardLoading = () => (
  <div className="dashboard-loading">
    <div className="loading-content">
      <div className="loading-spinner"></div>
      <h2>Chargement de votre tableau de bord...</h2>
      <p>Préparation de vos données personnalisées</p>
    </div>
  </div>
);

const StatCard = ({ icon: Icon, title, value, subtitle, progress, color }) => (
  <div className={`stat-card ${color}`}>
    <div className="stat-header">
      <div className="stat-icon">
        <Icon />
      </div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <div className="stat-value">{value}</div>
        {subtitle && <div className="stat-subtitle">{subtitle}</div>}
      </div>
    </div>
    {progress !== undefined && (
      <div className="stat-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="progress-text">{Math.round(progress)}%</span>
      </div>
    )}
  </div>
);

const CourseCard = ({ course }) => (
  <div className="course-card">
    <div className="course-header">
      <div className="course-info">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-description">{course.description}</p>
      </div>
      <span className={`difficulty-badge ${course.difficulty.toLowerCase()}`}>
        {course.difficulty}
      </span>
    </div>
    
    <div className="course-progress">
      <div className="progress-info">
        <span>Progression</span>
        <span>{course.progress}%</span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${course.progress}%` }}
        ></div>
      </div>
    </div>
    
    <button className="course-btn">
      {course.progress > 0 ? 'Continuer' : 'Commencer'}
      <FiArrowRight />
    </button>
  </div>
);

const ActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'lesson': return FiPlay;
      case 'exercise': return FiCheckSquare;
      case 'quiz': return FiTarget;
      default: return FiBookOpen;
    }
  };

  const getActivityColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in-progress': return 'blue';
      default: return 'gray';
    }
  };

  const Icon = getActivityIcon(activity.type);
  const color = getActivityColor(activity.status);

  return (
    <div className={`activity-item ${color}`}>
      <div className="activity-icon">
        <Icon />
      </div>
      <div className="activity-content">
        <h4 className="activity-title">{activity.title}</h4>
        <p className="activity-time">{activity.time}</p>
      </div>
      <div className={`activity-status ${activity.status}`}>
        {activity.status === 'completed' ? '✓' : '⏳'}
      </div>
    </div>
  );
};

const GoalItem = ({ title, progress, total, icon: Icon, color }) => (
  <div className={`goal-item ${color}`}>
    <div className="goal-header">
      <div className="goal-icon">
        <Icon />
      </div>
      <div className="goal-content">
        <h4 className="goal-title">{title}</h4>
        <div className="goal-progress">
          {progress}/{total}
        </div>
      </div>
    </div>
    <div className="goal-bar">
      <div 
        className="goal-fill" 
        style={{ width: `${(progress / total) * 100}%` }}
      ></div>
    </div>
  </div>
);

export default ModernDashboard;
