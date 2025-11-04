import React, { useEffect, useState } from 'react';
import '../../styles/courseTheme.css';
import { useNavigate, useParams } from 'react-router-dom';
import { getLevelsByPath, getPathsByCategory, getCategories } from '../../services/courseService';
import LoadingSpinner from '../../components/LoadingSpinner';
import LevelCard from '../../components/LevelCard';
// Access control removed for specific-language flow

export default function SpecificPathLevels() {
  const navigate = useNavigate();
  const { categoryId, pathId } = useParams();
  const [levels, setLevels] = useState([]);
  const [path, setPath] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Access control removed

  useEffect(() => {
    (async () => {
      try {
        const [levelsData, pathsData, categoriesData] = await Promise.all([
          getLevelsByPath(pathId),
          getPathsByCategory(categoryId),
          getCategories('specific')
        ]);
        
        setLevels(levelsData || []);
        const currentPath = pathsData?.find(p => p._id === pathId);
        const currentCategory = categoriesData?.find(cat => cat._id === categoryId);
        setPath(currentPath);
        setCategory(currentCategory);

        // Access control removed
      } catch (e) {
        setError('Erreur lors du chargement des niveaux');
      } finally {
        setLoading(false);
      }
    })();
  }, [categoryId, pathId]);

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
        <p style={{ color: '#6b7280', fontSize: 16 }}>Chargement des niveaux...</p>
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
  const pathName = path?.translations?.fr?.name || 'Parcours';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
      <div className="container-responsive">
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
        <button
          onClick={() => navigate(`/learning/specific/${categoryId}`)}
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
          {categoryName}
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
          {pathName}
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
          Niveaux {pathName}
        </h1>
        <p style={{ 
          fontSize: 18, 
          opacity: 0.9,
          maxWidth: 600,
          margin: '0 auto',
          lineHeight: 1.6
        }}>
          Progresse étape par étape dans ton apprentissage de {categoryName}
        </p>
      </div>

      {/* Progress Overview */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 24,
        marginBottom: 32,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 16
        }}>
          <h3 style={{ 
            color: 'white', 
            fontSize: 20, 
            fontWeight: 700,
            margin: 0
          }}>
            Progression
          </h3>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '8px 16px',
            borderRadius: 20,
            color: 'white',
            fontSize: 14,
            fontWeight: 600
          }}>
            {levels.length} niveaux
          </div>
        </div>
        
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: 10,
          height: 8,
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'linear-gradient(90deg, #4facfe, #00f2fe)',
            height: '100%',
            width: '0%', // TODO: Calculate actual progress
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Levels Grid */}
      <div className="levels-grid">
        {levels.map((level, index) => {
          const isUnlocked = true; // access control removed; all levels clickable
          
          return (
            <div key={level._id} style={{ position: 'relative' }}>
              {/* Level number badge */}
              <div style={{
                position: 'absolute',
                top: -12,
                left: 20,
                zIndex: 10,
                background: isUnlocked 
                  ? 'linear-gradient(135deg, #4facfe, #00f2fe)' 
                  : 'linear-gradient(135deg, #9ca3af, #6b7280)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: 20,
                fontSize: 14,
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}>
                Niveau {index + 1}
              </div>

              {/* Level card */}
              <div className="card-surface" style={{ padding: 24 }}>
                <LevelCard 
                  level={level}
                  onLevelClick={() => {
                    navigate(`/courses/levels/${level._id}`, { state: { fromSpecific: true, categoryId, pathId } });
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* No levels message */}
      {levels.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: 40,
          color: 'white'
        }}>
          <h3 style={{ fontSize: 20, marginBottom: 8 }}>Aucun niveau disponible</h3>
          <p style={{ opacity: 0.8 }}>Les niveaux pour ce parcours seront bientôt disponibles</p>
        </div>
      )}

      {/* Navigation buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <button
          onClick={() => navigate(`/learning/specific/${categoryId}`)}
          className="btn-ghost"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
          }}
        >
          ← Retour aux parcours
        </button>

        <button
          onClick={() => navigate('/learning/choose-language')}
          className="btn-ghost"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
          }}
        >
          Tous les langages
        </button>
      </div>
      </div>
    </div>
  );
}