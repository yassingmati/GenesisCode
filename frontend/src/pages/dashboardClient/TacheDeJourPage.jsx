import React, { useState } from 'react';

export default function DailyTasks() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Complète le quiz du jour', status: 'Non commencé' },
    { id: 2, title: 'Résous un puzzle de code', status: 'Non commencé' },
    { id: 3, title: 'Révision des concepts clés', status: 'Terminé' },
    { id: 4, title: 'Pratique avec un exercice', status: 'Non commencé' },
  ]);
  
  const [newTask, setNewTask] = useState('');
  const [showReward, setShowReward] = useState(false);
  
  // Calculer le pourcentage de complétion
  const completedCount = tasks.filter(task => task.status === 'Terminé').length;
  const completionPercentage = Math.round((completedCount / tasks.length) * 100);
  
  // Basculer le statut d'une tâche
  const toggleTaskStatus = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === 'Non commencé' ? 'Terminé' : 'Non commencé' } 
        : task
    ));
    
    // Vérifier si toutes les tâches sont terminées
    const allCompleted = tasks.filter(t => t.id !== taskId).every(t => t.status === 'Terminé') && 
                         tasks.find(t => t.id === taskId).status === 'Non commencé';
    
    if (allCompleted) {
      setShowReward(true);
      setTimeout(() => setShowReward(false), 5000);
    }
  };
  
  // Ajouter une nouvelle tâche
  const addTask = () => {
    if (newTask.trim()) {
      setTasks([
        ...tasks,
        { id: tasks.length + 1, title: newTask, status: 'Non commencé' }
      ]);
      setNewTask('');
    }
  };
  
  return (
    <div style={styles.container}>
      {/* Récompense animée */}
      {showReward && (
        <div style={styles.rewardContainer}>
          <div style={styles.rewardCard}>
            <div style={styles.rewardIcon}>🏆</div>
            <div style={styles.rewardText}>
              <h3 style={styles.rewardTitle}>Félicitations!</h3>
              <p style={styles.rewardDescription}>Vous avez complété toutes vos tâches quotidiennes</p>
            </div>
          </div>
        </div>
      )}
      
      <div style={styles.card}>
        {/* En-tête avec progression */}
        <div style={styles.header}>
          <h1 style={styles.title}>Missions du jour</h1>
          <p style={styles.subtitle}>Terminez vos tâches quotidiennes pour débloquer des récompenses</p>
          
          <div style={styles.progressContainer}>
            <div style={styles.progressInfo}>
              <span>Progression</span>
              <span>{completionPercentage}%</span>
            </div>
            <div style={styles.progressBar}>
              <div 
                style={{
                  ...styles.progressFill,
                  width: `${completionPercentage}%`,
                  background: `linear-gradient(90deg, #4CAF50 ${completionPercentage}%, #8BC34A 100%)`
                }}
              ></div>
            </div>
            <div style={styles.progressStats}>
              {completedCount} sur {tasks.length} tâches complétées
            </div>
          </div>
        </div>
        
        {/* Formulaire d'ajout de tâche */}
        <div style={styles.addTaskContainer}>
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Ajouter une nouvelle tâche..."
            style={styles.taskInput}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
          />
          <button onClick={addTask} style={styles.addButton}>
            Ajouter
          </button>
        </div>
        
        {/* Liste des tâches */}
        <ul style={styles.taskList}>
          {tasks.map(task => (
            <li 
              key={task.id}
              style={{
                ...styles.taskItem,
                background: task.status === 'Terminé' ? '#E8F5E9' : '#ffffff',
                boxShadow: task.status === 'Terminé' ? '0 4px 12px rgba(76, 175, 80, 0.2)' : styles.taskItem.boxShadow
              }}
              onClick={() => toggleTaskStatus(task.id)}
            >
              <div style={styles.taskCheckbox}>
                <div style={{
                  ...styles.checkbox,
                  background: task.status === 'Terminé' ? '#4CAF50' : '#ffffff',
                  borderColor: task.status === 'Terminé' ? '#4CAF50' : '#ddd'
                }}>
                  {task.status === 'Terminé' && (
                    <span style={styles.checkmark}>✓</span>
                  )}
                </div>
              </div>
              
              <div style={styles.taskContent}>
                <h3 style={{
                  ...styles.taskTitle,
                  textDecoration: task.status === 'Terminé' ? 'line-through' : 'none',
                  color: task.status === 'Terminé' ? '#777' : '#333'
                }}>
                  {task.title}
                </h3>
                <span style={{
                  ...styles.taskStatus,
                  background: task.status === 'Terminé' ? '#4CAF50' : '#2196F3',
                  color: '#fff'
                }}>
                  {task.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Styles CSS en JavaScript
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  card: {
    width: '100%',
    maxWidth: '600px',
    background: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  },
  header: {
    background: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)',
    color: '#fff',
    padding: '30px',
    textAlign: 'center'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '10px'
  },
  subtitle: {
    fontSize: '16px',
    opacity: '0.9',
    marginBottom: '20px'
  },
  progressContainer: {
    marginTop: '20px'
  },
  progressInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px'
  },
  progressBar: {
    height: '12px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '10px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: '10px',
    transition: 'width 0.5s ease-in-out'
  },
  progressStats: {
    textAlign: 'right',
    marginTop: '8px',
    fontSize: '14px',
    opacity: '0.9'
  },
  addTaskContainer: {
    display: 'flex',
    padding: '20px',
    borderBottom: '1px solid #eee'
  },
  taskInput: {
    flex: '1',
    padding: '12px 15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border 0.3s',
    marginRight: '10px',
    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
    ':focus': {
      borderColor: '#4b6cb7',
      boxShadow: '0 0 0 3px rgba(75, 108, 183, 0.2)'
    }
  },
  addButton: {
    background: '#4b6cb7',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.3s',
    ':hover': {
      background: '#3a5a9c'
    }
  },
  taskList: {
    listStyle: 'none',
    padding: '0',
    margin: '0'
  },
  taskItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '18px 20px',
    borderBottom: '1px solid #f0f0f0',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
    ':hover': {
      background: '#f9f9f9',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08)'
    },
    ':last-child': {
      borderBottom: 'none'
    }
  },
  taskCheckbox: {
    marginRight: '15px'
  },
  checkbox: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: '2px solid #ddd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease'
  },
  checkmark: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  taskContent: {
    flex: '1'
  },
  taskTitle: {
    fontSize: '18px',
    margin: '0 0 5px 0',
    fontWeight: '600',
    transition: 'color 0.3s'
  },
  taskStatus: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  rewardContainer: {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: '1000',
    animation: 'slideIn 0.5s, fadeOut 0.5s 4.5s forwards'
  },
  rewardCard: {
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
    color: '#333',
    padding: '15px 25px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    alignItems: 'center',
    minWidth: '300px'
  },
  rewardIcon: {
    fontSize: '32px',
    marginRight: '15px'
  },
  rewardText: {
    flex: '1'
  },
  rewardTitle: {
    margin: '0',
    fontSize: '18px',
    fontWeight: '700'
  },
  rewardDescription: {
    margin: '5px 0 0 0',
    fontSize: '14px',
    opacity: '0.9'
  },
  // Styles d'animation
  '@keyframes slideIn': {
    from: { top: '-100px', opacity: 0 },
    to: { top: '20px', opacity: 1 }
  },
  '@keyframes fadeOut': {
    from: { opacity: 1 },
    to: { opacity: 0, visibility: 'hidden' }
  }
};