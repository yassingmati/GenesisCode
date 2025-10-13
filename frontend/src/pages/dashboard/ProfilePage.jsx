import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProfilePage.css'; // Nous allons créer ce fichier CSS
import ParentInvitationSection from '../../components/ParentInvitationSection';

const API_BASE = 'http://localhost:5000/api';

function getAuthHeader() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatDateIso(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return iso;
  }
}

function daysUntil(iso) {
  if (!iso) return null;
  const now = new Date();
  const end = new Date(iso);
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_BASE}/users/profile`, { headers: getAuthHeader() });
        const data = res.data;
        const u = data.user || data;
        if (!mounted) return;
        setUser(u);
        setForm({ firstName: u.firstName || '', lastName: u.lastName || '', phone: u.phone || '' });

        if (u && (u._id || u.id)) {
          loadProgress(u._id || u.id);
        }
      } catch (err) {
        console.error('loadProfile error', err);
        const msg = err.response?.data?.error || err.response?.data?.message || err.message;
        if (mounted) setError(msg || 'Erreur lors du chargement du profil');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    async function loadProgress(userId) {
      try {
        const res = await axios.get(`${API_BASE}/users/progress/${userId}`, { headers: getAuthHeader() });
        if (res?.data) setProgress(res.data);
      } catch (err) {
        console.warn('Impossible de charger les progrès', err);
      }
    }

    loadProfile();
    return () => { mounted = false; };
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.firstName.trim()) return 'Le prénom est requis';
    if (!form.lastName.trim()) return 'Le nom est requis';
    if (form.phone && !/^\+?[0-9 \-()]{6,20}$/.test(form.phone)) return 'Numéro de téléphone invalide';
    return null;
  };

  const onSave = async (e) => {
    e && e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }

    setSaving(true);
    setError(null);
    try {
      const payload = { firstName: form.firstName.trim(), lastName: form.lastName.trim(), phone: form.phone.trim() || null };
      const res = await axios.put(`${API_BASE}/users/profile`, payload, { headers: getAuthHeader() });
      const updated = res.data.user || res.data;
      setUser(updated);
      setEditMode(false);
      setMessage('Profil mis à jour avec succès');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('onSave error', err);
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(msg || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    if (!user) return;
    setForm({ firstName: user.firstName || '', lastName: user.lastName || '', phone: user.phone || '' });
    setError(null);
    setEditMode(false);
  };

  const onDelete = async () => {
    const ok = window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.');
    if (!ok) return;

    setDeleting(true);
    try {
      const id = user && (user._id || user.id);
      if (!id) throw new Error('ID utilisateur introuvable');
      await axios.delete(`${API_BASE}/users/${id}`, { headers: getAuthHeader() });
      window.location.href = '/goodbye';
    } catch (err) {
      console.error('onDelete error', err);
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(msg || 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const getInitials = (u) => {
    if (!u) return '';
    const a = (u.firstName || '').trim();
    const b = (u.lastName || '').trim();
    if (a || b) return `${(a[0]||'').toUpperCase()}${(b[0]||'').toUpperCase()}`;
    if (u.email) return u.email.slice(0,2).toUpperCase();
    return 'U';
  };

  const renderSubscription = (sub) => {
    if (!sub) return (
      <div className="subscription-card no-subscription">
        <div className="subscription-icon">📊</div>
        <h3>Aucun abonnement actif</h3>
        <p>Abonnez-vous pour accéder à tous nos contenus premium</p>
        <button className="subscribe-btn">Voir les offres</button>
      </div>
    );
    
    const status = sub.status || sub.konnectStatus || '—';
    const plan = sub.planId || sub.plan || '—';
    const endIso = sub.currentPeriodEnd || sub.current_period_end;
    const endDate = endIso ? formatDateIso(endIso) : '—';
    const days = endIso ? daysUntil(endIso) : null;
    
    let statusClass = 'status-badge';
    if (status.toLowerCase() === 'active') statusClass += ' active';
    else if (status.toLowerCase() === 'canceled') statusClass += ' canceled';
    
    return (
      <div className="subscription-card">
        <div className="subscription-header">
          <h3>Votre abonnement</h3>
          <span className={statusClass}>{status}</span>
        </div>
        
        <div className="subscription-details">
          <div className="detail-item">
            <span className="label">Plan:</span>
            <span className="value">{plan}</span>
          </div>
          
          <div className="detail-item">
            <span className="label">Prochain renouvellement:</span>
            <span className="value">{endDate}</span>
          </div>
          
          <div className="detail-item">
            <span className="label">Jours restants:</span>
            <span className="value">{days} jour(s)</span>
          </div>
          
          <div className="detail-item">
            <span className="label">Annulation programmée:</span>
            <span className="value">{sub.cancelAtPeriodEnd ? 'Oui' : 'Non'}</span>
          </div>
        </div>
        
        <div className="subscription-actions">
          <button className="action-btn secondary">Changer de plan</button>
          <button className="action-btn warning">Gérer l'abonnement</button>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Chargement de votre profil...</p>
    </div>
  );

  return (
    <div className="profile-container">
      

      <div className="profile-content">
        <div className="sidebar">
          <div className="user-card">
            <div className="avatar-large">
              {getInitials(user)}
            </div>
            <h2>{user?.firstName} {user?.lastName}</h2>
            <p>{user?.email}</p>
            
            <div className="stats">
              <div className="stat">
                <span className="stat-value">{progress.length}</span>
                <span className="stat-label">Exercices</span>
              </div>
              <div className="stat">
                <span className="stat-value">{user?.badges?.length || 0}</span>
                <span className="stat-label">Badges</span>
              </div>
            </div>
          </div>
          
          <nav className="sidebar-nav">
            <button 
              className={activeTab === 'profile' ? 'nav-item active' : 'nav-item'} 
              onClick={() => setActiveTab('profile')}
            >
              <span>👤</span> Informations personnelles
            </button>
            <button 
              className={activeTab === 'progress' ? 'nav-item active' : 'nav-item'} 
              onClick={() => setActiveTab('progress')}
            >
              <span>📊</span> Mes progrès
            </button>
            <button 
              className={activeTab === 'subscription' ? 'nav-item active' : 'nav-item'} 
              onClick={() => setActiveTab('subscription')}
            >
              <span>💎</span> Abonnement
            </button>
            <button 
              className={activeTab === 'parent' ? 'nav-item active' : 'nav-item'} 
              onClick={() => setActiveTab('parent')}
            >
              <span>👨‍👩‍👧‍👦</span> Invitations parent
            </button>
            <button 
              className={activeTab === 'settings' ? 'nav-item active' : 'nav-item'} 
              onClick={() => setActiveTab('settings')}
            >
              <span>⚙️</span> Paramètres
            </button>
          </nav>
        </div>

        <div className="main-content">
          {error && <div className="alert error">{error}</div>}
          {message && <div className="alert success">{message}</div>}

          {activeTab === 'profile' && (
            <div className="tab-content">
              <div className="section-header">
                <h2>Informations personnelles</h2>
                {!editMode ? (
                  <button className="edit-btn" onClick={() => setEditMode(true)}>
                    <span>✏️</span> Modifier
                  </button>
                ) : (
                  <div className="edit-actions">
                    <button className="save-btn" onClick={onSave} disabled={saving}>
                      {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                    <button className="cancel-btn" onClick={onCancel}>Annuler</button>
                  </div>
                )}
              </div>

              <div className="form-section">
                <div className="form-row">
                  <div className="form-group">
                    <label>Prénom</label>
                    {!editMode ? (
                      <div className="read-only-field">{user?.firstName || '—'}</div>
                    ) : (
                      <input 
                        type="text" 
                        name="firstName" 
                        value={form.firstName} 
                        onChange={onChange} 
                        placeholder="Votre prénom" 
                      />
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>Nom</label>
                    {!editMode ? (
                      <div className="read-only-field">{user?.lastName || '—'}</div>
                    ) : (
                      <input 
                        type="text" 
                        name="lastName" 
                        value={form.lastName} 
                        onChange={onChange} 
                        placeholder="Votre nom" 
                      />
                    )}
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <div className="read-only-field">{user?.email || '—'}</div>
                  <small>L'adresse email ne peut pas être modifiée</small>
                </div>
                
                <div className="form-group">
                  <label>Téléphone</label>
                  {!editMode ? (
                    <div className="read-only-field">{user?.phone || '—'}</div>
                  ) : (
                    <input 
                      type="tel" 
                      name="phone" 
                      value={form.phone} 
                      onChange={onChange} 
                      placeholder="+216 12 345 678" 
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="tab-content">
              <div className="section-header">
                <h2>Mes progrès</h2>
                <button className="export-btn">Exporter les données</button>
              </div>
              
              <div className="progress-grid">
                {progress.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📊</div>
                    <h3>Aucun progrès enregistré</h3>
                    <p>Commencez à utiliser notre plateforme pour voir vos progrès ici</p>
                  </div>
                ) : (
                  progress.map((p, i) => (
                    <div key={p._id || i} className="progress-card">
                      <div className="progress-header">
                        <h4>{p.exercise?.title || p.exercise?.name || 'Exercice sans nom'}</h4>
                        <span className={`status ${p.completed ? 'completed' : 'in-progress'}`}>
                          {p.completed ? 'Complété' : 'En cours'}
                        </span>
                      </div>
                      <div className="progress-details">
                        <div className="xp-badge">{p.xp ?? 0} XP</div>
                        <div className="progress-date">
                          {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('fr-FR') : '—'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="tab-content">
              <div className="section-header">
                <h2>Gestion de l'abonnement</h2>
              </div>
              
              {renderSubscription(user?.subscription)}
              
              <div className="badges-section">
                <h3>Mes badges</h3>
                <div className="badges-container">
                  {user?.badges && user.badges.length > 0 ? (
                    user.badges.map((badge, index) => (
                      <div key={index} className="badge">
                        <span className="badge-icon">🏆</span>
                        <span className="badge-name">{badge}</span>
                      </div>
                    ))
                  ) : (
                    <div className="empty-badges">
                      <p>Vous n'avez pas encore de badges</p>
                      <small>Completez des exercices pour débloquer des badges</small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'parent' && (
            <div className="tab-content">
              <div className="section-header">
                <h2>Invitations parent</h2>
                <p>Gérez les invitations de vos parents pour suivre votre progression</p>
              </div>
              
              <ParentInvitationSection user={user} />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="tab-content">
              <div className="section-header">
                <h2>Paramètres du compte</h2>
              </div>
              
              <div className="danger-zone">
                <h3>Zone dangereuse</h3>
                <p>Ces actions sont irréversibles. Veuillez procéder avec prudence.</p>
                
                <div className="danger-actions">
                  <button 
                    className="delete-account-btn" 
                    onClick={onDelete} 
                    disabled={deleting}
                  >
                    {deleting ? 'Suppression en cours...' : 'Supprimer mon compte'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}