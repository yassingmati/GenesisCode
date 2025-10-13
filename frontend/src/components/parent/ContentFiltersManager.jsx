// src/components/parent/ContentFiltersManager.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const FiltersContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    border-radius: 20px 20px 0 0;
  }
`;

const FiltersHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const FiltersTitle = styled.h3`
  color: #2c3e50;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const FilterLevel = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const LevelLabel = styled.span`
  font-weight: 500;
  color: #495057;
`;

const LevelSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 2px solid rgba(231, 76, 60, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #e74c3c;
    box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
  }
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h4`
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const KeywordsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const KeywordTag = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.type === 'blocked' 
    ? 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)' 
    : 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)'
  };
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  animation: slideIn 0.3s ease;

  @keyframes slideIn {
    from { 
      opacity: 0; 
      transform: scale(0.8) translateY(-10px); 
    }
    to { 
      opacity: 1; 
      transform: scale(1) translateY(0); 
    }
  }
`;

const RemoveButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
`;

const InputContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const KeywordInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid rgba(231, 76, 60, 0.2);
  border-radius: 8px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #e74c3c;
    box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
  }
`;

const AddButton = styled.button`
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: linear-gradient(135deg, #c0392b 0%, #a93226 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const CategoryCard = styled.div`
  background: ${props => props.allowed 
    ? 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)' 
    : props.blocked 
    ? 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
    : 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)'
  };
  color: white;
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  font-weight: 500;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    
    &::before {
      left: 100%;
    }
  }
`;

const CategoryIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const CategoryName = styled.div`
  font-size: 1rem;
  font-weight: 600;
`;

const CategoryStatus = styled.div`
  font-size: 0.8rem;
  opacity: 0.9;
  margin-top: 0.25rem;
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin-top: 2rem;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

  &:hover {
    background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const PresetTemplates = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const TemplateButton = styled.button`
  flex: 1;
  padding: 1rem;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    transform: translateY(-2px);
  }

  &.active {
    border-color: #667eea;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
`;

export default function ContentFiltersManager({ 
  filters = {}, 
  onFiltersChange, 
  onSave,
  loading = false,
  saving = false 
}) {
  const [localFilters, setLocalFilters] = useState({
    contentFilterLevel: 'moderate',
    blockedKeywords: [],
    allowedCategories: [],
    blockedCategories: [],
    autoBlockInappropriate: true,
    ...filters
  });

  const [newKeyword, setNewKeyword] = useState('');
  const [keywordType, setKeywordType] = useState('blocked');

  const categories = [
    { id: 'programming', name: 'Programmation', icon: '💻' },
    { id: 'mathematics', name: 'Mathématiques', icon: '🔢' },
    { id: 'science', name: 'Sciences', icon: '🔬' },
    { id: 'language', name: 'Langues', icon: '📚' },
    { id: 'art', name: 'Arts', icon: '🎨' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'gaming', name: 'Jeux', icon: '🎮' },
    { id: 'social', name: 'Social', icon: '👥' }
  ];

  const filterLevels = [
    { value: 'none', label: 'Aucun', description: 'Aucun filtrage' },
    { value: 'basic', label: 'Basique', description: 'Filtrage minimal' },
    { value: 'moderate', label: 'Modéré', description: 'Filtrage équilibré' },
    { value: 'strict', label: 'Strict', description: 'Filtrage maximum' }
  ];

  const templates = [
    {
      name: 'Éducatif',
      description: 'Focus sur l\'éducation',
      filters: {
        contentFilterLevel: 'moderate',
        allowedCategories: ['programming', 'mathematics', 'science', 'language'],
        blockedCategories: ['gaming', 'social'],
        autoBlockInappropriate: true
      }
    },
    {
      name: 'Équilibré',
      description: 'Équilibre éducation/divertissement',
      filters: {
        contentFilterLevel: 'basic',
        allowedCategories: ['programming', 'mathematics', 'science', 'art'],
        blockedCategories: [],
        autoBlockInappropriate: true
      }
    },
    {
      name: 'Permissif',
      description: 'Accès large avec surveillance',
      filters: {
        contentFilterLevel: 'basic',
        allowedCategories: [],
        blockedCategories: [],
        autoBlockInappropriate: false
      }
    }
  ];

  useEffect(() => {
    setLocalFilters({ ...filters });
  }, [filters]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const addKeyword = () => {
    if (!newKeyword.trim()) return;

    const keywords = localFilters[keywordType === 'blocked' ? 'blockedKeywords' : 'allowedKeywords'] || [];
    if (!keywords.includes(newKeyword.trim())) {
      const newFilters = {
        ...localFilters,
        [keywordType === 'blocked' ? 'blockedKeywords' : 'allowedKeywords']: [...keywords, newKeyword.trim()]
      };
      setLocalFilters(newFilters);
      setNewKeyword('');
      if (onFiltersChange) {
        onFiltersChange(newFilters);
      }
    }
  };

  const removeKeyword = (keyword, type) => {
    const keywords = localFilters[type === 'blocked' ? 'blockedKeywords' : 'allowedKeywords'] || [];
    const newFilters = {
      ...localFilters,
      [type === 'blocked' ? 'blockedKeywords' : 'allowedKeywords']: keywords.filter(k => k !== keyword)
    };
    setLocalFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const toggleCategory = (categoryId) => {
    const allowed = localFilters.allowedCategories || [];
    const blocked = localFilters.blockedCategories || [];
    
    let newAllowed = [...allowed];
    let newBlocked = [...blocked];
    
    if (allowed.includes(categoryId)) {
      newAllowed = allowed.filter(id => id !== categoryId);
    } else if (blocked.includes(categoryId)) {
      newBlocked = blocked.filter(id => id !== categoryId);
    } else {
      newAllowed.push(categoryId);
    }
    
    const newFilters = {
      ...localFilters,
      allowedCategories: newAllowed,
      blockedCategories: newBlocked
    };
    
    setLocalFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const applyTemplate = (template) => {
    const newFilters = { ...localFilters, ...template.filters };
    setLocalFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const getCategoryStatus = (categoryId) => {
    const allowed = localFilters.allowedCategories || [];
    const blocked = localFilters.blockedCategories || [];
    
    if (allowed.includes(categoryId)) return 'allowed';
    if (blocked.includes(categoryId)) return 'blocked';
    return 'neutral';
  };

  const getCategoryStatusText = (status) => {
    switch (status) {
      case 'allowed': return 'Autorisé';
      case 'blocked': return 'Bloqué';
      default: return 'Neutre';
    }
  };

  return (
    <FiltersContainer>
      <FiltersHeader>
        <FiltersTitle>🔒 Filtres de Contenu</FiltersTitle>
        <FilterLevel>
          <LevelLabel>Niveau de filtrage:</LevelLabel>
          <LevelSelect
            value={localFilters.contentFilterLevel}
            onChange={(e) => handleFilterChange('contentFilterLevel', e.target.value)}
          >
            {filterLevels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label} - {level.description}
              </option>
            ))}
          </LevelSelect>
        </FilterLevel>
      </FiltersHeader>

      {/* Templates prédéfinis */}
      <Section>
        <SectionTitle>📋 Templates Prédéfinis</SectionTitle>
        <PresetTemplates>
          {templates.map((template, index) => (
            <TemplateButton
              key={index}
              onClick={() => applyTemplate(template)}
            >
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                {template.name}
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                {template.description}
              </div>
            </TemplateButton>
          ))}
        </PresetTemplates>
      </Section>

      {/* Mots-clés bloqués */}
      <Section>
        <SectionTitle>🚫 Mots-clés Bloqués</SectionTitle>
        <InputContainer>
          <KeywordInput
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Ajouter un mot-clé à bloquer"
            onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
          />
          <AddButton onClick={addKeyword} disabled={!newKeyword.trim()}>
            + Ajouter
          </AddButton>
        </InputContainer>
        <KeywordsContainer>
          {(localFilters.blockedKeywords || []).map((keyword, index) => (
            <KeywordTag key={index} type="blocked">
              {keyword}
              <RemoveButton onClick={() => removeKeyword(keyword, 'blocked')}>
                ×
              </RemoveButton>
            </KeywordTag>
          ))}
        </KeywordsContainer>
      </Section>

      {/* Catégories */}
      <Section>
        <SectionTitle>📂 Catégories de Contenu</SectionTitle>
        <CategoriesGrid>
          {categories.map(category => {
            const status = getCategoryStatus(category.id);
            return (
              <CategoryCard
                key={category.id}
                allowed={status === 'allowed'}
                blocked={status === 'blocked'}
                onClick={() => toggleCategory(category.id)}
              >
                <CategoryIcon>{category.icon}</CategoryIcon>
                <CategoryName>{category.name}</CategoryName>
                <CategoryStatus>{getCategoryStatusText(status)}</CategoryStatus>
              </CategoryCard>
            );
          })}
        </CategoriesGrid>
      </Section>

      {/* Options avancées */}
      <Section>
        <SectionTitle>⚙️ Options Avancées</SectionTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <input
            type="checkbox"
            id="autoBlockInappropriate"
            checked={localFilters.autoBlockInappropriate}
            onChange={(e) => handleFilterChange('autoBlockInappropriate', e.target.checked)}
            style={{ transform: 'scale(1.2)' }}
          />
          <label htmlFor="autoBlockInappropriate" style={{ fontWeight: '500', cursor: 'pointer' }}>
            Bloquer automatiquement le contenu inapproprié
          </label>
        </div>
      </Section>

      <SaveButton onClick={() => onSave && onSave(localFilters)} disabled={saving}>
        {saving ? 'Sauvegarde...' : 'Sauvegarder les filtres'}
      </SaveButton>
    </FiltersContainer>
  );
}
