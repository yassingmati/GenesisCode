// src/components/ParentInvitationSection.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

/**
 * Composant pour gérer les invitations parent dans le profil étudiant
 */
export default function ParentInvitationSection({ user }) {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (user && user.userType === 'student') {
      fetchInvitations();
    }
  }, [user]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/invitations/invitations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setInvitations(response.data);
    } catch (error) {
      console.error('Erreur chargement invitations:', error);
      if (error.response?.status === 404) {
        // Pas d'invitations, c'est normal
        setInvitations([]);
      } else {
        setError('Erreur lors du chargement des invitations');
      }
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async (invitationId) => {
    try {
      setError('');
      setSuccess('');
      setActionLoading(invitationId);
      
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/invitations/accept-invitation`, {
        invitationId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSuccess('Invitation acceptée avec succès !');
      fetchInvitations(); // Recharger les invitations
      
      // Notification de succès
      if (window.Notification && Notification.permission === 'granted') {
        new Notification('Invitation acceptée', {
          body: 'Vous avez accepté l\'invitation parent avec succès',
          icon: '/favicon.ico'
        });
      }
    } catch (error) {
      console.error('Erreur acceptation invitation:', error);
      setError('Erreur lors de l\'acceptation de l\'invitation');
    } finally {
      setActionLoading(null);
    }
  };

  const rejectInvitation = async (invitationId) => {
    try {
      setError('');
      setSuccess('');
      setActionLoading(invitationId);
      
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/invitations/reject-invitation`, {
        invitationId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSuccess('Invitation refusée');
      fetchInvitations(); // Recharger les invitations
      
      // Notification de succès
      if (window.Notification && Notification.permission === 'granted') {
        new Notification('Invitation refusée', {
          body: 'Vous avez refusé l\'invitation parent',
          icon: '/favicon.ico'
        });
      }
    } catch (error) {
      console.error('Erreur refus invitation:', error);
      setError('Erreur lors du refus de l\'invitation');
    } finally {
      setActionLoading(null);
    }
  };

  if (!user || user.userType !== 'student') {
    return null;
  }

  if (loading) {
    return (
      <div className="parent-invitation-section">
        <h3>👨‍👩‍👧‍👦 Invitations parent</h3>
        <div className="loading">Chargement des invitations...</div>
      </div>
    );
  }

  return (
    <div className="parent-invitation-section">
      <h3>👨‍👩‍👧‍👦 Invitations parent</h3>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {invitations.length === 0 ? (
        <div className="no-invitations">
          <p>Vous n'avez pas d'invitations parent en attente.</p>
          <p className="help-text">
            Si un parent souhaite suivre votre progression, il peut vous envoyer une invitation 
            depuis son espace parent.
          </p>
        </div>
      ) : (
        <div className="invitations-list">
          {invitations.map((invitation) => (
            <div key={invitation._id} className="invitation-card">
              <div className="invitation-header">
                <h4>Invitation de {invitation.parent.firstName} {invitation.parent.lastName}</h4>
                <span className="invitation-date">
                  {new Date(invitation.invitedAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
              
              <div className="invitation-content">
                <p>
                  <strong>{invitation.parent.firstName} {invitation.parent.lastName}</strong> 
                  souhaite suivre votre progression et vous aider dans votre apprentissage.
                </p>
                
                {invitation.parentalControls && (
                  <div className="parental-controls-preview">
                    <h5>Contrôles parentaux proposés :</h5>
                    <ul>
                      {invitation.parentalControls.dailyTimeLimit && (
                        <li>⏰ Limite de temps quotidienne : {invitation.parentalControls.dailyTimeLimit} minutes</li>
                      )}
                      {invitation.parentalControls.contentRestrictions && (
                        <li>🔒 Difficulté maximum : {invitation.parentalControls.contentRestrictions.maxDifficulty}</li>
                      )}
                      {invitation.parentalControls.weeklyGoals && (
                        <li>🎯 Objectifs hebdomadaires : {invitation.parentalControls.weeklyGoals.minExercises} exercices</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="invitation-actions">
                <button 
                  className="btn-accept"
                  onClick={() => acceptInvitation(invitation._id)}
                  disabled={actionLoading === invitation._id}
                >
                  {actionLoading === invitation._id ? (
                    <>
                      <span className="btn-icon loading">⏳</span>
                      <span className="btn-text">Traitement...</span>
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">✅</span>
                      <span className="btn-text">Accepter l'invitation</span>
                    </>
                  )}
                </button>
                <button 
                  className="btn-reject"
                  onClick={() => rejectInvitation(invitation._id)}
                  disabled={actionLoading === invitation._id}
                >
                  {actionLoading === invitation._id ? (
                    <>
                      <span className="btn-icon loading">⏳</span>
                      <span className="btn-text">Traitement...</span>
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">❌</span>
                      <span className="btn-text">Refuser</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .parent-invitation-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .parent-invitation-section h3 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .loading {
          text-align: center;
          color: #666;
          padding: 2rem;
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          border: 1px solid #fcc;
        }

        .success-message {
          background: #efe;
          color: #363;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          border: 1px solid #cfc;
        }

        .no-invitations {
          text-align: center;
          padding: 2rem;
          color: #666;
        }

        .help-text {
          font-size: 0.9rem;
          margin-top: 0.5rem;
          font-style: italic;
        }

        .invitations-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .invitation-card {
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          padding: 1rem;
          background: #f8f9fa;
        }

        .invitation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .invitation-header h4 {
          margin: 0;
          color: #333;
          font-size: 1rem;
        }

        .invitation-date {
          font-size: 0.8rem;
          color: #666;
        }

        .invitation-content p {
          margin: 0 0 0.75rem 0;
          color: #555;
        }

        .parental-controls-preview {
          background: white;
          padding: 0.75rem;
          border-radius: 6px;
          margin-top: 0.75rem;
        }

        .parental-controls-preview h5 {
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
          color: #333;
        }

        .parental-controls-preview ul {
          margin: 0;
          padding-left: 1rem;
        }

        .parental-controls-preview li {
          font-size: 0.85rem;
          color: #666;
          margin-bottom: 0.25rem;
        }

        .invitation-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .btn-accept, .btn-reject {
          flex: 1;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          position: relative;
          overflow: hidden;
        }

        .btn-accept {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
        }

        .btn-accept:hover:not(:disabled) {
          background: linear-gradient(135deg, #218838 0%, #1ea085 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
        }

        .btn-reject {
          background: linear-gradient(135deg, #dc3545 0%, #e74c3c 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
        }

        .btn-reject:hover:not(:disabled) {
          background: linear-gradient(135deg, #c82333 0%, #c0392b 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
        }

        .btn-accept:disabled, .btn-reject:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-icon {
          font-size: 1rem;
        }

        .btn-text {
          font-weight: 600;
        }

        .btn-icon.loading {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
