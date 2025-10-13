// src/pages/parent/ParentalControlsNew.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useParentalControlsManager, ParentalControlsErrorDisplay } from '../../components/ParentalControlsErrorHandler';
import ContentFiltersManager from '../../components/parent/ContentFiltersManager';
import RewardsSystem from '../../components/parent/RewardsSystem';
import ActivityChart from '../../components/parent/ActivityChart';

const ControlsContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const Header = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 12px 40px rgba(0,0,0,0.15),
      0 0 0 1px rgba(255, 255, 255, 0.3);
  }
`;

const HeaderTitle = styled.h1`
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const HeaderSubtitle = styled.p`
  color: #6c757d;
  margin: 0;
  font-size: 1.1rem;
`;

const TemplateSelector = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const TemplateCard = styled.div`
  background: ${props => props.selected 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  color: ${props => props.selected ? 'white' : '#2c3e50'};
  padding: 2rem;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${props => props.selected 
    ? 'transparent' 
    : 'rgba(102, 126, 234, 0.2)'
  };
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
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    
    &::before {
      left: 100%;
    }
  }
`;

const TemplateIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const TemplateTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
`;

const TemplateDescription = styled.p`
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  opacity: 0.8;
  text-align: center;
  line-height: 1.4;
`;

const TemplateFeatures = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.8rem;
  opacity: 0.9;
`;

const TemplateFeature = styled.li`
  padding: 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '✓';
    font-weight: bold;
  }
`;

const AccordionContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  margin-bottom: 2rem;
  box-shadow:
    0 8px 32px rgba(0,0,0,0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
  overflow: hidden;
`;

const AccordionHeader = styled.div`
  padding: 1.5rem 2rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
  };
  color: ${props => props.active ? 'white' : '#2c3e50'};
  transition: all 0.3s ease;
  border-bottom: ${props => props.active ? 'none' : '1px solid rgba(0, 0, 0, 0.1)'};

  &:hover {
    background: ${props => props.active 
      ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)' 
      : 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)'
    };
  }
`;

const AccordionTitle = styled.h3`
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const AccordionIcon = styled.div`
  font-size: 1.5rem;
  transition: transform 0.3s ease;
  transform: ${props => props.active ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const AccordionContent = styled.div`
  padding: ${props => props.active ? '2rem' : '0'};
  max-height: ${props => props.active ? '2000px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
`;

const PreviewContainer = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const PreviewTitle = styled.h4`
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
`;

const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const PreviewItem = styled.div`
  background: rgba(255, 255, 255, 0.8);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const PreviewLabel = styled.div`
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
  font-weight: 500;
`;

const PreviewValue = styled.div`
  font-size: 1rem;
  color: #2c3e50;
  font-weight: 600;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
`;

const ActionButton = styled.button`
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

    &:hover {
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }
  }

  &.secondary {
    background: rgba(108, 117, 125, 0.1);
    color: #6c757d;
    border: 1px solid rgba(108, 117, 125, 0.2);

    &:hover {
      background: rgba(108, 117, 125, 0.2);
      transform: translateY(-1px);
    }
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: #6c757d;
`;

export default function ParentalControlsNew() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [activeAccordion, setActiveAccordion] = useState('time');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const {
    controls,
    loading: controlsLoading,
    error,
    updateControls,
    saveControls
  } = useParentalControlsManager(childId);

  const templates = [
    {
      id: 'strict',
      name: 'Strict',
      icon: '🔒',
      description: 'Contrôles maximum pour sécurité optimale',
      features: [
        'Temps limité (1h/jour)',
        'Filtrage strict du contenu',
        'Pauses obligatoires',
        'Surveillance renforcée'
      ],
      settings: {
        dailyTimeLimit: 60,
        weeklyTimeLimit: 300,
        contentFilterLevel: 'strict',
        mandatoryBreaks: { enabled: true, breakInterval: 20 },
        allowAdvancedTopics: false,
        allowPublicDiscussions: false,
        allowChat: false
      }
    },
    {
      id: 'balanced',
      name: 'Équilibré',
      icon: '⚖️',
      description: 'Équilibre entre sécurité et autonomie',
      features: [
        'Temps modéré (2h/jour)',
        'Filtrage modéré',
        'Pauses recommandées',
        'Accès éducatif'
      ],
      settings: {
        dailyTimeLimit: 120,
        weeklyTimeLimit: 600,
        contentFilterLevel: 'moderate',
        mandatoryBreaks: { enabled: true, breakInterval: 30 },
        allowAdvancedTopics: true,
        allowPublicDiscussions: false,
        allowChat: false
      }
    },
    {
      id: 'permissive',
      name: 'Permissif',
      icon: '🔓',
      description: 'Autonomie maximale avec surveillance',
      features: [
        'Temps étendu (3h/jour)',
        'Filtrage basique',
        'Pauses optionnelles',
        'Accès large'
      ],
      settings: {
        dailyTimeLimit: 180,
        weeklyTimeLimit: 900,
        contentFilterLevel: 'basic',
        mandatoryBreaks: { enabled: false },
        allowAdvancedTopics: true,
        allowPublicDiscussions: true,
        allowChat: true
      }
    }
  ];

  const accordionSections = [
    {
      id: 'time',
      title: '⏰ Limites de Temps',
      icon: '⏰',
      content: (
        <div>
          <h4>Configuration des limites de temps</h4>
          <p>Définissez les limites quotidiennes et hebdomadaires pour l'utilisation de la plateforme.</p>
          {/* Contenu des contrôles de temps */}
        </div>
      )
    },
    {
      id: 'content',
      title: '🔒 Filtres de Contenu',
      icon: '🔒',
      content: <ContentFiltersManager />
    },
    {
      id: 'breaks',
      title: '⏸️ Pauses Obligatoires',
      icon: '⏸️',
      content: (
        <div>
          <h4>Configuration des pauses</h4>
          <p>Définissez les intervalles et durées des pauses obligatoires.</p>
          {/* Contenu des pauses */}
        </div>
      )
    },
    {
      id: 'rewards',
      title: '🏆 Système de Récompenses',
      icon: '🏆',
      content: <RewardsSystem />
    },
    {
      id: 'analytics',
      title: '📊 Analytics',
      icon: '📊',
      content: (
        <div>
          <h4>Statistiques et analytics</h4>
          <ActivityChart 
            data={[
              { label: 'Lun', value: 45 },
              { label: 'Mar', value: 60 },
              { label: 'Mer', value: 30 },
              { label: 'Jeu', value: 75 },
              { label: 'Ven', value: 90 }
            ]}
            title="Temps d'activité cette semaine"
            type="bar"
          />
        </div>
      )
    }
  ];

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setPreviewData(template.settings);
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return;
    
    setLoading(true);
    try {
      await updateControls(selectedTemplate.settings);
      setPreviewData(null);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Erreur application template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveControls();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleAccordion = (sectionId) => {
    setActiveAccordion(activeAccordion === sectionId ? null : sectionId);
  };

  if (controlsLoading) {
    return (
      <ControlsContainer>
        <LoadingSpinner>Chargement des contrôles...</LoadingSpinner>
      </ControlsContainer>
    );
  }

  if (error) {
    return (
      <ControlsContainer>
        <ParentalControlsErrorDisplay error={error} />
      </ControlsContainer>
    );
  }

  return (
    <ControlsContainer>
      <Header>
        <HeaderTitle>⚙️ Contrôles Parentaux</HeaderTitle>
        <HeaderSubtitle>
          Configurez les paramètres de sécurité et d'utilisation pour votre enfant
        </HeaderSubtitle>
      </Header>

      {/* Sélecteur de templates */}
      <TemplateSelector>
        <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>
          📋 Templates Prédéfinis
        </h3>
        <TemplateGrid>
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              selected={selectedTemplate?.id === template.id}
              onClick={() => handleTemplateSelect(template)}
            >
              <TemplateIcon>{template.icon}</TemplateIcon>
              <TemplateTitle>{template.name}</TemplateTitle>
              <TemplateDescription>{template.description}</TemplateDescription>
              <TemplateFeatures>
                {template.features.map((feature, index) => (
                  <TemplateFeature key={index}>{feature}</TemplateFeature>
                ))}
              </TemplateFeatures>
            </TemplateCard>
          ))}
        </TemplateGrid>

        {selectedTemplate && (
          <PreviewContainer>
            <PreviewTitle>👁️ Aperçu du Template "{selectedTemplate.name}"</PreviewTitle>
            <PreviewGrid>
              <PreviewItem>
                <PreviewLabel>Temps quotidien</PreviewLabel>
                <PreviewValue>{selectedTemplate.settings.dailyTimeLimit} min</PreviewValue>
              </PreviewItem>
              <PreviewItem>
                <PreviewLabel>Filtrage</PreviewLabel>
                <PreviewValue>{selectedTemplate.settings.contentFilterLevel}</PreviewValue>
              </PreviewItem>
              <PreviewItem>
                <PreviewLabel>Pauses</PreviewLabel>
                <PreviewValue>
                  {selectedTemplate.settings.mandatoryBreaks.enabled ? 'Activées' : 'Désactivées'}
                </PreviewValue>
              </PreviewItem>
              <PreviewItem>
                <PreviewLabel>Contenu avancé</PreviewLabel>
                <PreviewValue>
                  {selectedTemplate.settings.allowAdvancedTopics ? 'Autorisé' : 'Bloqué'}
                </PreviewValue>
              </PreviewItem>
            </PreviewGrid>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              <ActionButton 
                className="primary"
                onClick={handleApplyTemplate}
                disabled={loading}
              >
                {loading ? '⏳ Application...' : '✅ Appliquer ce template'}
              </ActionButton>
              <ActionButton 
                className="secondary"
                onClick={() => {
                  setSelectedTemplate(null);
                  setPreviewData(null);
                }}
              >
                ❌ Annuler
              </ActionButton>
            </div>
          </PreviewContainer>
        )}
      </TemplateSelector>

      {/* Sections accordéon */}
      {accordionSections.map((section) => (
        <AccordionContainer key={section.id}>
          <AccordionHeader
            active={activeAccordion === section.id}
            onClick={() => toggleAccordion(section.id)}
          >
            <AccordionTitle>
              {section.icon} {section.title}
            </AccordionTitle>
            <AccordionIcon active={activeAccordion === section.id}>
              ▼
            </AccordionIcon>
          </AccordionHeader>
          <AccordionContent active={activeAccordion === section.id}>
            {section.content}
          </AccordionContent>
        </AccordionContainer>
      ))}

      {/* Boutons d'action */}
      <ActionButtons>
        <ActionButton 
          className="secondary"
          onClick={() => navigate('/parent/dashboard')}
        >
          ← Retour au Dashboard
        </ActionButton>
        <ActionButton 
          className="primary"
          onClick={handleSave}
        disabled={saving}
      >
          {saving ? '⏳ Sauvegarde...' : '💾 Sauvegarder les Contrôles'}
        </ActionButton>
      </ActionButtons>
    </ControlsContainer>
  );
}
