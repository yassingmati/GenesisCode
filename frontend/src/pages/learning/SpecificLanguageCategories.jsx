import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../../services/courseService';
import LoadingSpinner from '../../components/LoadingSpinner';
import LanguageCard from '../../components/LanguageCard';
import Breadcrumb from '../../components/Breadcrumb';
import AdvancedSearch from '../../components/AdvancedSearch';
import '../../styles/courseTheme.css';
import '../../pages/learning/SpecificLanguageStyles.css';

// Pas d'icônes pour les langages

// Couleurs de thème pour chaque langage
const languageColors = {
  'Java': { bg: '#f8f9ff', border: '#3b82f6', text: '#1e40af' },
  'Python': { bg: '#f0fdf4', border: '#10b981', text: '#047857' },
  'React': { bg: '#fef3f2', border: '#f97316', text: '#c2410c' },
  'C++': { bg: '#f3f4f6', border: '#6b7280', text: '#374151' },
  'JavaScript': { bg: '#fffbeb', border: '#f59e0b', text: '#d97706' },
  'TypeScript': { bg: '#eff6ff', border: '#2563eb', text: '#1d4ed8' },
  'C#': { bg: '#f0f9ff', border: '#0ea5e9', text: '#0284c7' },
  'Go': { bg: '#f0fdfa', border: '#14b8a6', text: '#0f766e' },
  'Rust': { bg: '#fef2f2', border: '#ef4444', text: '#dc2626' },
  'Swift': { bg: '#f8fafc', border: '#64748b', text: '#475569' }
};

export default function SpecificLanguageCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await getCategories('specific');
        setCategories(data || []);
      } catch (e) {
        setError('Erreur lors du chargement des catégories');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredCategories = categories.filter(cat => {
    const name = cat?.translations?.fr?.name || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        flexDirection: 'column',
        gap: 16
      }}>
        <LoadingSpinner />
        <p style={{ color: '#6b7280', fontSize: 16 }}>Chargement des langages disponibles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: 24, 
        textAlign: 'center',
        maxWidth: 600,
        margin: '0 auto'
      }}>
        <div style={{ 
          color: '#dc2626', 
          fontSize: 18, 
          marginBottom: 16,
          fontWeight: 600
        }}>
          {error}
        </div>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 24px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 600
          }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'var(--bg-gradient)'
    }}>
      <div className="container-responsive">
      {/* Header Section */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: 40,
        color: 'white'
      }}>
        <h1 style={{ 
          fontSize: 32, 
          fontWeight: 800, 
          marginBottom: 12,
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          Choisir ton propre langage
        </h1>
        <p style={{ 
          fontSize: 18, 
          opacity: 0.9,
          maxWidth: 600,
          margin: '0 auto',
          lineHeight: 1.6
        }}>
          Sélectionne le langage de programmation que tu veux apprendre et commence ton parcours personnalisé
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ 
        maxWidth: 500, 
        margin: '0 auto 32px',
        position: 'relative'
      }}>
        <input
          type="text"
          placeholder="🔍 Rechercher un langage..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '16px 20px',
            borderRadius: 12,
            border: 'none',
            fontSize: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            outline: 'none',
            background: 'white'
          }}
        />
      </div>

      {/* Categories Grid */}
      <div className="levels-grid">
        {filteredCategories.map(cat => {
          const name = cat?.translations?.fr?.name || 'Langage';
          const colors = languageColors[name] || { bg: '#f8fafc', border: '#e2e8f0', text: '#475569' };
          
          return (
            <div
              key={cat._id}
              onClick={() => navigate(`/learning/specific/${cat._id}`)}
              className="card-surface"
              style={{
                padding: 24,
                cursor: 'pointer',
                border: `2px solid ${colors.border}`,
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
              }}
            >
              {/* Decorative background */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 100,
                height: 100,
                background: `linear-gradient(135deg, ${colors.border}20, ${colors.border}10)`,
                borderRadius: '0 16px 0 100%'
              }} />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h3 style={{ 
                  fontSize: 24, 
                  fontWeight: 700, 
                  marginBottom: 8,
                  color: colors.text,
                  textAlign: 'center'
                }}>
                  {name}
                </h3>
                
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: 14,
                  textAlign: 'center',
                  marginBottom: 20,
                  lineHeight: 1.5
                }}>
                  Commence ton apprentissage en {name}
                </p>
                
                <div style={{
                  background: colors.bg,
                  padding: '12px 20px',
                  borderRadius: 8,
                  textAlign: 'center',
                  color: colors.text,
                  fontSize: 14,
                  fontWeight: 600
                }}>
                  Voir les parcours →
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No results message */}
      {filteredCategories.length === 0 && searchTerm && (
        <div style={{ 
          textAlign: 'center', 
          padding: 40,
          color: 'white'
        }}>
          <h3 style={{ fontSize: 20, marginBottom: 8 }}>Aucun langage trouvé</h3>
          <p style={{ opacity: 0.8 }}>Essaie avec un autre terme de recherche</p>
        </div>
      )}

      {/* Back to Dashboard */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-ghost"
        >
          ← Retour au tableau de bord
        </button>
      </div>
      </div>
    </div>
  );
}


