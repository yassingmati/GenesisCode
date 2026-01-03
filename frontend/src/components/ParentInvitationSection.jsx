
// src/components/ParentInvitationSection.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../utils/apiConfig';
import { IconUserShield, IconCheck, IconMail, IconUser } from '@tabler/icons-react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === 'production' ? '' : getApiUrl(''));

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
          'Authorization': `Bearer ${token} `,
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
          'Authorization': `Bearer ${token} `,
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
          'Authorization': `Bearer ${token} `,
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

      {/* Affichage du parent lié - Premium Design */}
      {user.parentAccount && (
        <div className="mb-8 relative group overflow-hidden rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-white dark:bg-slate-800/50 shadow-lg shadow-blue-500/5 transition-all hover:shadow-blue-500/10">
          {/* Decorative Background Gradient */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-300/20 blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-gradient-to-tr from-indigo-400/20 to-purple-300/20 blur-3xl rounded-full" />

          <div className="relative p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Icon / Avatar Area */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 ring-4 ring-white dark:ring-slate-800">
                <IconUserShield size={32} stroke={1.5} />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full border-2 border-white dark:border-slate-800 shadow-sm" title="Compte verifié">
                <IconCheck size={12} stroke={3} />
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {user.parentAccount.firstName} {user.parentAccount.lastName}
                </h4>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <IconUserShield size={12} /> Parent
                </span>
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-500 dark:text-gray-400 text-sm">
                  <IconMail size={16} className="text-gray-400" />
                  <span>{user.parentAccount.email}</span>
                </div>
                {user.parentAccount.phone && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-500 dark:text-gray-400 text-sm">
                    <IconUser size={16} className="text-gray-400" />
                    <span>{user.parentAccount.phone}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50 flex flex-wrap gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Surveillance active
                </div>
                <div className="flex items-center gap-1.5">
                  <IconCheck size={14} className="text-blue-500" />
                  Compte relié
                </div>
              </div>
            </div>
          </div>
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
  .parent - invitation - section {
  background: white;
  border - radius: 12px;
  padding: 1.5rem;
  margin - bottom: 1.5rem;
  box - shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

        .parent - invitation - section h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font - size: 1.2rem;
  display: flex;
  align - items: center;
  gap: 0.5rem;
}

        .loading {
  text - align: center;
  color: #666;
  padding: 2rem;
}

        .error - message {
  background: #fee;
  color: #c33;
  padding: 0.75rem;
  border - radius: 6px;
  margin - bottom: 1rem;
  border: 1px solid #fcc;
}

        .success - message {
  background: #efe;
  color: #363;
  padding: 0.75rem;
  border - radius: 6px;
  margin - bottom: 1rem;
  border: 1px solid #cfc;
}

        .no - invitations {
  text - align: center;
  padding: 2rem;
  color: #666;
}

        .help - text {
  font - size: 0.9rem;
  margin - top: 0.5rem;
  font - style: italic;
}

        .invitations - list {
  display: flex;
  flex - direction: column;
  gap: 1rem;
}

        .invitation - card {
  border: 1px solid #e1e5e9;
  border - radius: 8px;
  padding: 1rem;
  background: #f8f9fa;
}

        .invitation - header {
  display: flex;
  justify - content: space - between;
  align - items: center;
  margin - bottom: 0.75rem;
}

        .invitation - header h4 {
  margin: 0;
  color: #333;
  font - size: 1rem;
}

        .invitation - date {
  font - size: 0.8rem;
  color: #666;
}

        .invitation - content p {
  margin: 0 0 0.75rem 0;
  color: #555;
}

        .parental - controls - preview {
  background: white;
  padding: 0.75rem;
  border - radius: 6px;
  margin - top: 0.75rem;
}

        .parental - controls - preview h5 {
  margin: 0 0 0.5rem 0;
  font - size: 0.9rem;
  color: #333;
}

        .parental - controls - preview ul {
  margin: 0;
  padding - left: 1rem;
}

        .parental - controls - preview li {
  font - size: 0.85rem;
  color: #666;
  margin - bottom: 0.25rem;
}

        .invitation - actions {
  display: flex;
  gap: 0.75rem;
  margin - top: 1rem;
}

        .btn - accept, .btn - reject {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border - radius: 8px;
  font - weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align - items: center;
  justify - content: center;
  gap: 0.5rem;
  font - size: 0.9rem;
  position: relative;
  overflow: hidden;
}

        .btn - accept {
  background: linear - gradient(135deg, #28a745 0 %, #20c997 100 %);
  color: white;
  box - shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
}

        .btn - accept: hover: not(: disabled) {
  background: linear - gradient(135deg, #218838 0 %, #1ea085 100 %);
  transform: translateY(-2px);
  box - shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
}

        .btn - reject {
  background: linear - gradient(135deg, #dc3545 0 %, #e74c3c 100 %);
  color: white;
  box - shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
}

        .btn - reject: hover: not(: disabled) {
  background: linear - gradient(135deg, #c82333 0 %, #c0392b 100 %);
  transform: translateY(-2px);
  box - shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
}

        .btn - accept: disabled, .btn - reject:disabled {
  opacity: 0.6;
  cursor: not - allowed;
  transform: none;
}

        .btn - icon {
  font - size: 1rem;
}

        .btn - text {
  font - weight: 600;
}

        .btn - icon.loading {
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
