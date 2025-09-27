import React from 'react';

const StatsCard = () => {
  return (
    <div className="card stats-card">
      <h2 className="card-title">Statistiques du jour</h2>
      <div className="progress-container">
        <div className="progress-item">
          <div className="progress-header">
            <span className="progress-label">Pomodoros complétés</span>
            <span className="progress-value">3/8</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill green-gradient" style={{ width: '37.5%' }}></div>
          </div>
        </div>
        <div className="progress-item">
          <div className="progress-header">
            <span className="progress-label">Objectif quotidien</span>
            <span className="progress-value">65%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill purple-gradient" style={{ width: '65%' }}></div>
          </div>
        </div>
      </div>
      <div className="chart-container">
        <div className="chart">
          <svg className="chart-svg" viewBox="0 0 100 100">
            <circle className="chart-base" cx="50" cy="50" r="40" />
            <circle
              className="chart-progress"
              cx="50"
              cy="50"
              r="40"
              strokeDasharray="251.2"
              strokeDashoffset="87.92"
            />
            <text x="50" y="50" className="chart-text">
              65%
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;