import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPathsByCategory, getCategories } from '../../services/courseService';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/courseTheme.css';

export default function SpecificCategoryPaths() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [paths, setPaths] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [pathsData, categoriesData] = await Promise.all([
          getPathsByCategory(categoryId),
          getCategories('specific')
        ]);
        
        setPaths(pathsData || []);
        const currentCategory = categoriesData?.find(cat => cat._id === categoryId);
        setCategory(currentCategory);
      } catch (e) {
        setError('Erreur lors du chargement des parcours');
      } finally {
        setLoading(false);
      }
    })();
  }, [categoryId]);

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
        <p style={{ color: '#6b7280', fontSize: 16 }}>Chargement des parcours...</p>
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

  const categoryName = category?.translations?.fr?.name || 'Langage';

  return (
    <div style={{ 
      padding: '24px 16px', 
      maxWidth: 1200, 
      margin: '0 auto',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    }}>
      {/* Breadcrumb Navigation */}
      <div style={{ 
        marginBottom: 32,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => navigate('/learning/choose-language')}
          style={{
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)'
          }}
        >
          ← Langages
        </button>
        <span style={{ color: 'white', opacity: 0.7 }}>›</span>
        <span style={{ 
          color: 'white', 
          fontSize: 16, 
          fontWeight: 600,
          background: 'rgba(255,255,255,0.2)',
          padding: '8px 16px',
          borderRadius: 8,
          backdropFilter: 'blur(10px)'
        }}>
          {categoryName}
        </span>
      </div>

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
          Parcours {categoryName}
        </h1>
        <p style={{ 
          fontSize: 18, 
          opacity: 0.9,
          maxWidth: 600,
          margin: '0 auto',
          lineHeight: 1.6
        }}>
          Choisis le parcours qui correspond le mieux à ton niveau et tes objectifs
        </p>
      </div>

      {/* Paths Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: 24,
        marginBottom: 40
      }}>
        {paths.map((path, index) => (
          <div
            key={path._id}
            onClick={() => navigate(`/learning/specific/${categoryId}/paths/${path._id}`)}
            style={{
              background: 'white',
              borderRadius: 16,
              padding: 24,
              cursor: 'pointer',
              border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.15)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
            }}
          >
            {/* Path number badge */}
            <div style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700
            }}>
              Parcours {index + 1}
            </div>

            {/* Decorative background */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 100,
              height: 100,
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
              borderRadius: '0 0 100% 0'
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              
              <h3 style={{ 
                fontSize: 24, 
                fontWeight: 700, 
                marginBottom: 8,
                color: '#1f2937',
                textAlign: 'center'
              }}>
                {path?.translations?.fr?.name || 'Parcours'}
              </h3>
              
              <p style={{ 
                color: '#6b7280', 
                fontSize: 14,
                textAlign: 'center',
                marginBottom: 20,
                lineHeight: 1.5
              }}>
                {path?.translations?.fr?.description || 'Commence ce parcours pour progresser en ' + categoryName}
              </p>
              
              <div style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                padding: '12px 20px',
                borderRadius: 8,
                textAlign: 'center',
                color: 'white',
                fontSize: 14,
                fontWeight: 600
              }}>
                Voir les niveaux →
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No paths message */}
      {paths.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: 40,
          color: 'white'
        }}>
          <h3 style={{ fontSize: 20, marginBottom: 8 }}>Aucun parcours disponible</h3>
          <p style={{ opacity: 0.8 }}>Les parcours pour {categoryName} seront bientôt disponibles</p>
        </div>
      )}

      {/* Back to Categories */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => navigate('/learning/choose-language')}
          style={{
            padding: '12px 24px',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: 12,
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 600,
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
          }}
        >
          ← Retour aux langages
        </button>
      </div>
    </div>
  );
}