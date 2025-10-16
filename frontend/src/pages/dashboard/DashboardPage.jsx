import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import PomodoroPage from "./PomodoroPage";
import TacheDeJourPage from "./TacheDeJourPage";
import ProfilePage from "./ProfilePage";
import NotificationCenter from "../../components/NotificationCenter";
import SubscriptionButton from "../../components/SubscriptionButton";

/**
 * DashboardPage.jsx
 * - Point d'entrée de la page dashboard qui importe Header / Sidebar / Footer
 * - Injecte le CSS global minimal (keyframes + media queries pour les className utilisées)
 * - Contient WelcomeCard & OptionCard (petits composants locaux)
 */

export default function DashboardPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activePage, setActivePage] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Charger les données utilisateur
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Erreur parsing user data:', error);
      }
    }
  }, []);

  // Inject global CSS once (keyframes + media queries)
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("dashboard-global-styles")) return;

    const css = `
      /* Keyframes */
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      /* Small responsive / utility rules used by Header/Sidebar/Footer */
      @media (min-width: 768px) {
        .dashboardGrid { grid-template-columns: 1fr 1fr !important; }
        .optionsContainer { flex-direction: row !important; }
        .cardContent { padding: 3rem !important; }
        .title { font-size: 2.5rem !important; display: block !important; }
        .sidebar { width: 256px !important; }
        .logoContainer { display: block !important; padding: 24px !important; }
        .tabIcon { margin-right: 12px !important; }
        .tabName { display: inline !important; }
        .userPanel { width: 256px !important; }
        .userInfo { display: block !important; }
        .mobileMenuButton { display: none !important; }
      }

      /* Styles responsives pour la section d'abonnement */
      @media (max-width: 768px) {
        .subscription-header { flex-direction: column !important; align-items: center !important; text-align: center !important; }
        .subscription-icon { width: 60px !important; height: 60px !important; }
        .subscription-title { font-size: 24px !important; }
        .subscription-features { justify-content: center !important; }
        .subscription-actions { flex-direction: column !important; width: 100% !important; }
        .subscription-actions button { width: 100% !important; }
      }

      @media (max-width: 480px) {
        .subscription-card { padding: 24px !important; }
        .subscription-title { font-size: 20px !important; }
        .subscription-features { flex-direction: column !important; }
        .feature-item { width: 100% !important; justify-content: center !important; }
      }

      /* Styles pour le sélecteur de langue dans le dashboard */
      .dashboard-language-selector {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        color: white;
        backdrop-filter: blur(10px);
      }

      .dashboard-language-selector .language-label {
        color: rgba(255, 255, 255, 0.9);
        font-weight: 600;
        margin-right: 0.5rem;
      }

      .dashboard-language-selector .language-select {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 6px;
        color: white;
        padding: 0.5rem 1rem;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .dashboard-language-selector .language-select:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
      }

      .dashboard-language-selector .language-select:focus {
        outline: none;
        border-color: rgba(255, 255, 255, 0.5);
        box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
      }

      .dashboard-language-selector .language-select option {
        background: #1e3a8a;
        color: white;
        padding: 0.5rem;
      }
        .desktopActions { display: flex !important; }
        .logoutText { display: inline !important; }
        .container { flex-direction: row !important; justify-content: space-between !important; align-items: center !important; }
        .copyright { margin-bottom: 0 !important; }
      }

      .inactiveTab:hover { background-color: #4f46e5 !important; }
      .link:hover { color: #a5b4fc !important; }
      .menuItem:hover { background-color: #4a5568 !important; }
      .notificationButton:hover, .menuButton:hover { background-color: rgba(255,255,255,0.2) !important; transform: scale(1.05); }
      .bubbleButton:hover { background: rgba(255,255,255,0.3) !important; transform: scale(1.1); }
      .logoutButton:hover { transform: translateY(-2px) !important; box-shadow: 0 6px 8px rgba(0,0,0,0.2) !important; }
    `;

    const styleTag = document.createElement("style");
    styleTag.id = "dashboard-global-styles";
    styleTag.appendChild(document.createTextNode(css));
    document.head.appendChild(styleTag);

    return () => {
      const el = document.getElementById("dashboard-global-styles");
      if (el) el.remove();
    };
  }, []);

  // small transition loader when switching pages
  useEffect(() => {
    if (activePage !== "dashboard") {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [activePage]);

  const handleWelcomeSelect = (option) => {
    if (option === "language") navigate('/learning/choose-language');
    else if (option === "path") navigate('/courses');
    else setActivePage("dashboard");
  };

  const renderPage = () => {
    if (isLoading) {
      return (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
        </div>
      );
    }

    switch (activePage) {
      case "pomodoro":
        return <PomodoroPage />;
      case "tasks":
        return <TacheDeJourPage />;
      case "profile":
        return <ProfilePage />;
      default:
         return (
           <div>
             <WelcomeCard onSelectOption={handleWelcomeSelect} t={t} navigate={navigate} />
             
             {/* Section d'abonnement améliorée */}
             <div style={styles.subscriptionSection}>
               <div style={styles.subscriptionCard} className="subscription-card">
                 <div style={styles.subscriptionHeader} className="subscription-header">
                   <div style={styles.subscriptionIcon} className="subscription-icon">
                     <span style={styles.iconEmoji}>🚀</span>
                   </div>
                   <div style={styles.subscriptionInfo}>
                     <h3 style={styles.subscriptionTitle} className="subscription-title">Débloquez votre potentiel</h3>
                     <p style={styles.subscriptionDescription}>
                       Accédez à tous les parcours et débloquez votre potentiel de programmation
                     </p>
                     <div style={styles.subscriptionFeatures} className="subscription-features">
                       <div style={styles.featureItem} className="feature-item">
                         <span style={styles.featureIcon}>✨</span>
                         <span style={styles.featureText}>Accès illimité</span>
                       </div>
                       <div style={styles.featureItem} className="feature-item">
                         <span style={styles.featureIcon}>🎯</span>
                         <span style={styles.featureText}>Parcours personnalisés</span>
                       </div>
                       <div style={styles.featureItem} className="feature-item">
                         <span style={styles.featureIcon}>📊</span>
                         <span style={styles.featureText}>Suivi des progrès</span>
                       </div>
                     </div>
                   </div>
                 </div>
                 <div style={styles.subscriptionActions} className="subscription-actions">
                   <SubscriptionButton 
                     variant="premium" 
                     className="large"
                   />
                   <SubscriptionButton 
                     variant="outline" 
                     className="small"
                   />
                 </div>
               </div>
             </div>
             
             {/* Centre de notifications */}
             {user && user.userType === 'student' && (
               <NotificationCenter user={user} />
             )}
             
            <div style={styles.dashboardGrid} className="dashboardGrid">
              <div style={styles.statsCard}>
                <h2 style={styles.cardTitle}>Statistiques du jour</h2>
                <div style={styles.progressContainer}>
                  <div>
                    <div style={styles.progressHeader}>
                      <span style={styles.progressLabel}>Pomodoros complétés</span>
                      <span style={styles.progressValue}>3/8</span>
                    </div>
                    <div style={styles.progressBar}>
                      <div
                        style={{ ...styles.progressFill, ...styles.greenGradient, width: "37.5%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div style={styles.progressHeader}>
                      <span style={styles.progressLabel}>Objectif quotidien</span>
                      <span style={styles.progressValue}>65%</span>
                    </div>
                    <div style={styles.progressBar}>
                      <div
                        style={{ ...styles.progressFill, ...styles.purpleGradient, width: "65%" }}
                      />
                    </div>
                  </div>
                </div>

                <div style={styles.chartContainer}>
                  <div style={styles.chart}>
                    <svg style={styles.chartSvg} viewBox="0 0 100 100">
                      <circle style={styles.chartBase} cx="50" cy="50" r="40" />
                      <circle
                        style={styles.chartProgress}
                        cx="50"
                        cy="50"
                        r="40"
                        strokeDasharray="251.2"
                        strokeDashoffset="87.92"
                      />
                      <text x="50" y="50" style={styles.chartText}>
                        65%
                      </text>
                    </svg>
                  </div>
                </div>
              </div>

              <div style={styles.tasksCard}>
                <div style={styles.tasksHeader}>
                  <h2 style={styles.cardTitle}>Tâches récentes</h2>
                  <button style={styles.viewAllButton} onClick={() => setActivePage("tasks")}>
                    Voir tout
                  </button>
                </div>

                <ul style={styles.taskList}>
                  {[
                    { text: "Réunion d'équipe", status: "done", time: "9:00 - 10:00" },
                    { text: "Rapport mensuel", status: "progress", time: "10:30 - 12:00" },
                    { text: "Refonte UI", status: "pending", time: "14:00 - 16:00" },
                    { text: "Révision code", status: "done", time: "16:30 - 17:30" },
                  ].map((task, index) => (
                    <li key={index} style={styles.taskItem}>
                      <div
                        style={{
                          ...styles.taskStatus,
                          ...(task.status === "done"
                            ? styles.statusDone
                            : task.status === "progress"
                            ? styles.statusProgress
                            : styles.statusPending),
                        }}
                      >
                        {task.status === "done" ? "✓" : task.status === "progress" ? "↻" : "!"}
                      </div>

                      <div style={styles.taskInfo}>
                        <p style={styles.taskText}>{task.text}</p>
                        <p style={styles.taskTime}>{task.time}</p>
                      </div>

                      <div style={styles.taskAction} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={styles.appContainer}>
      <Header setActivePage={setActivePage} />

      <div style={styles.mainContainer}>
        <Sidebar activePage={activePage} setActivePage={setActivePage} />

        <main style={styles.contentArea}>{renderPage()}</main>
      </div>

      <Footer />
    </div>
  );
}

/* ===========================
   WelcomeCard + OptionCard (local)
   =========================== */
const WelcomeCard = ({ onSelectOption, t, navigate }) => {
  return (
    <div style={welcomeStyles.container}>
      <div style={welcomeStyles.card}>
        <div style={welcomeStyles.cardContent} className="cardContent">
          <div style={welcomeStyles.header}>
             <h1 style={welcomeStyles.title} className="title">
               <span style={welcomeStyles.emoji}>👋</span>
               {t('welcome')} sur GenesisCode !
             </h1>
             <p style={welcomeStyles.subtitle}>{t('welcomeMessage')}</p>
          </div>

          <div style={welcomeStyles.optionsContainer} className="optionsContainer">
            <OptionCard
              emoji="🚀"
              title={t('chooseLanguage')}
              description={t('chooseLanguageDesc')}
              onClick={() => onSelectOption && onSelectOption("language")}
            />

            <OptionCard
              emoji="🧭"
              title={t('followPath')}
              description={t('followPathDesc')}
              onClick={() => navigate('/courses')}
            />
          </div>

          <div style={welcomeStyles.footer}>
             <p style={welcomeStyles.pulseText}>
               <span style={welcomeStyles.pointer}>👉</span>
               {t('startAdventure')}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const OptionCard = ({ emoji, title, description, onClick }) => (
  <button onClick={onClick} style={welcomeStyles.optionButton}>
    <div style={welcomeStyles.optionCard}>
      <div style={welcomeStyles.optionEmoji}>{emoji}</div>
      <h3 style={welcomeStyles.optionTitle}>{title}</h3>
      <p style={welcomeStyles.optionDescription}>{description}</p>
    </div>
  </button>
);

/* ===========================
   Styles (JS objects)
   =========================== */
const styles = {
  appContainer: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    background: "linear-gradient(to bottom, #f9fafb, #f3f4f6)",
  },
  mainContainer: { display: "flex", flex: 1 },
  contentArea: {
    flex: 1,
    padding: "16px",
    overflowY: "auto",
    transition: "all 0.3s",
  },

  loadingContainer: { display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" },
  spinner: {
    width: "64px",
    height: "64px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #4f46e5",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  statsCard: {
    background: "linear-gradient(to bottom right, white, #f9fafb)",
    borderRadius: "24px",
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
    padding: "24px",
    border: "1px solid #f3f4f6",
    transition: "all 0.3s",
  },
  tasksCard: {
    background: "linear-gradient(to bottom right, white, #f9fafb)",
    borderRadius: "24px",
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
    padding: "24px",
    border: "1px solid #f3f4f6",
    transition: "all 0.3s",
  },
  cardTitle: { fontSize: "1.25rem", fontWeight: "700", color: "#374151", marginBottom: "16px" },

  dashboardGrid: { display: "grid", gridTemplateColumns: "1fr", gap: "32px", marginTop: "32px" },
  
  // Styles pour la section d'abonnement améliorée
  subscriptionSection: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto"
  },
  
  subscriptionCard: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "24px",
    padding: "40px",
    color: "white",
    boxShadow: "0 20px 40px rgba(102, 126, 234, 0.25)",
    position: "relative",
    overflow: "hidden",
    border: "1px solid rgba(255, 255, 255, 0.1)"
  },
  
  subscriptionHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "24px",
    marginBottom: "32px",
    position: "relative",
    zIndex: 2
  },
  
  subscriptionIcon: {
    flexShrink: 0,
    width: "80px",
    height: "80px",
    background: "rgba(255, 255, 255, 0.15)",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)"
  },
  
  iconEmoji: {
    fontSize: "32px",
    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))"
  },
  
  subscriptionInfo: {
    flex: 1
  },
  
  subscriptionTitle: {
    margin: "0 0 12px 0",
    fontSize: "28px",
    fontWeight: "700",
    color: "white",
    lineHeight: "1.2"
  },
  
  subscriptionDescription: {
    margin: "0 0 20px 0",
    fontSize: "16px",
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: "1.6"
  },
  
  subscriptionFeatures: {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px"
  },
  
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255, 255, 255, 0.1)",
    padding: "8px 16px",
    borderRadius: "12px",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.15)"
  },
  
  featureIcon: {
    fontSize: "16px"
  },
  
  featureText: {
    fontSize: "14px",
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.95)"
  },
  
  subscriptionActions: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
    zIndex: 2
  },
  progressContainer: { display: "flex", flexDirection: "column", gap: "16px" },
  progressHeader: { display: "flex", justifyContent: "space-between", marginBottom: "4px" },
  progressLabel: { color: "#6b7280" },
  progressValue: { fontWeight: "700" },
  progressBar: { height: "12px", backgroundColor: "#e5e7eb", borderRadius: "9999px", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: "9999px" },
  greenGradient: { background: "linear-gradient(to right, #34d399, #0ea5e9)" },
  purpleGradient: { background: "linear-gradient(to right, #c084fc, #7c3aed)" },

  chartContainer: { display: "flex", justifyContent: "center", marginTop: "24px" },
  chart: { position: "relative", width: "160px", height: "160px" },
  chartSvg: { width: "100%", height: "100%" },
  chartBase: { stroke: "#e5e7eb", strokeWidth: "10", fill: "transparent" },
  chartProgress: {
    stroke: "#10b981",
    strokeWidth: "10",
    strokeLinecap: "round",
    fill: "transparent",
    transform: "rotate(-90deg)",
    transformOrigin: "center",
  },
  chartText: {
    fontFamily: "Verdana, sans-serif",
    fontSize: "12px",
    textAnchor: "middle",
    dominantBaseline: "middle",
    fontWeight: "700",
    fill: "#374151",
  },

  tasksHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  viewAllButton: { color: "#4f46e5", fontWeight: "600", background: "none", border: "none", cursor: "pointer", padding: "4px 8px" },
  taskList: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" },
  taskItem: {
    display: "flex",
    alignItems: "center",
    padding: "12px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #f3f4f6",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  taskStatus: { width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "12px", fontSize: "1rem", fontWeight: "bold" },
  statusDone: { backgroundColor: "#dcfce7", color: "#16a34a" },
  statusProgress: { backgroundColor: "#fef9c3", color: "#ca8a04" },
  statusPending: { backgroundColor: "#fee2e2", color: "#dc2626" },
  taskInfo: { flex: 1 },
  taskText: { fontWeight: "500", color: "#374151", marginBottom: "4px" },
  taskTime: { fontSize: "0.875rem", color: "#6b7280" },
  taskAction: { width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#d1d5db" },
};

const welcomeStyles = {
  container: {
    minHeight: "60vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(to bottom right, #1e3a8a, #6d28d9, #1d4ed8)",
    padding: "1rem",
    borderRadius: "12px",
  },
  card: {
    width: "100%",
    maxWidth: "768px",
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(12px)",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 20px 40px -20px rgba(0,0,0,0.5)",
    overflow: "hidden",
  },
  cardContent: { padding: "2rem" },
  header: { textAlign: "center", marginBottom: "2rem" },
  title: { fontSize: "2.25rem", fontWeight: "700", color: "white", marginBottom: "1rem", lineHeight: "1.2" },
  emoji: { marginRight: "0.75rem" },
  subtitle: { fontSize: "1.125rem", color: "rgba(255,255,255,0.9)", lineHeight: "1.5" },
  optionsContainer: { display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "2rem" },
  footer: { display: "flex", alignItems: "center", justifyContent: "center", animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" },
  pulseText: { fontSize: "1.125rem", fontWeight: "600", color: "#7dd3fc", display: "flex", alignItems: "center" },
  pointer: { marginRight: "0.5rem", fontSize: "1.25rem" },
  optionButton: { flex: "1", background: "linear-gradient(to right, #06b6d4, #2563eb)", borderRadius: "16px", padding: "1px", cursor: "pointer", transition: "all 0.3s ease", border: "none" },
  optionCard: { background: "rgba(31,41,55,0.85)", borderRadius: "14px", padding: "1.5rem", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  optionEmoji: { fontSize: "2.25rem", marginBottom: "1rem" },
  optionTitle: { fontSize: "1.125rem", fontWeight: "700", color: "white", marginBottom: "0.5rem" },
  optionDescription: { color: "rgba(255,255,255,0.8)", lineHeight: "1.5" },
};
