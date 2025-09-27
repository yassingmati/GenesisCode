import React from 'react';

const TasksCard = ({ tasks, onViewAll }) => {
  return (
    <div style={styles.card}>
      <div style={styles.tasksHeader}>
        <h2 style={styles.cardTitle}>Tâches récentes</h2>
        <button 
          style={styles.viewAllButton}
          onClick={onViewAll}
          aria-label="Voir toutes les tâches"
        >
          Voir tout
        </button>
      </div>
      
      <ul style={styles.taskList}>
        {tasks.length === 0 ? (
          <li style={styles.emptyState}>Aucune tâche pour le moment</li>
        ) : (
          tasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onClick={() => console.log('open task', task.id)} 
            />
          ))
        )}
      </ul>
    </div>
  );
};

const TaskItem = ({ task, onClick }) => {
  const statusConfig = {
    done: { style: styles.statusDone, icon: '✓' },
    progress: { style: styles.statusProgress, icon: '↻' },
    pending: { style: styles.statusPending, icon: '!' }
  };
  
  const { style, icon } = statusConfig[task.status] || statusConfig.pending;
  
  return (
    <li style={styles.taskItem} onClick={onClick}>
      <div style={{ ...styles.taskStatus, ...style }}>
        {icon}
      </div>
      
      <div style={styles.taskInfo}>
        <p style={styles.taskText}>{task.text}</p>
        <p style={styles.taskTime}>{task.time}</p>
      </div>
      
      <div style={styles.taskAction} />
    </li>
  );
};

const styles = {
  card: {
    background: 'linear-gradient(to bottom right, white, #f9fafb)',
    borderRadius: 16,
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)',
    padding: 24,
    border: '1px solid #f3f4f6',
    animation: 'slideIn 0.4s ease-out 0.1s both'
  },
  tasksHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: 700, 
    color: '#111827', 
    margin: 0 
  },
  viewAllButton: { 
    color: '#4f46e5', 
    fontWeight: 600, 
    background: 'none', 
    border: 'none', 
    cursor: 'pointer', 
    padding: '6px 10px',
    borderRadius: 6,
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: 'rgba(79, 70, 229, 0.1)'
    }
  },
  taskList: { 
    listStyle: 'none', 
    padding: 0, 
    margin: 0, 
    display: 'flex', 
    flexDirection: 'column', 
    gap: 12 
  },
  emptyState: {
    textAlign: 'center',
    color: '#9ca3af',
    padding: 20,
    fontStyle: 'italic'
  },
  taskItem: { 
    display: 'flex', 
    alignItems: 'center', 
    padding: 12, 
    backgroundColor: 'white', 
    borderRadius: 10, 
    border: '1px solid #f3f4f6', 
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    }
  },
  taskStatus: { 
    width: 36, 
    height: 36, 
    borderRadius: '50%', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 12, 
    fontSize: 14, 
    fontWeight: 700 
  },
  statusDone: { 
    backgroundColor: '#dcfce7', 
    color: '#16a34a' 
  },
  statusProgress: { 
    backgroundColor: '#fef9c3', 
    color: '#ca8a04' 
  },
  statusPending: { 
    backgroundColor: '#fee2e2', 
    color: '#dc2626' 
  },
  taskInfo: { 
    flex: 1 
  },
  taskText: { 
    fontWeight: 600, 
    color: '#111827', 
    margin: '0 0 4px 0' 
  },
  taskTime: { 
    fontSize: 13, 
    color: '#6b7280', 
    margin: 0 
  },
  taskAction: { 
    width: 10, 
    height: 10, 
    borderRadius: 999, 
    backgroundColor: '#d1d5db' 
  }
};

export default TasksCard;