import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus, FiToggleLeft, FiToggleRight, FiRefreshCw, FiCreditCard, FiUsers, FiSettings } from 'react-icons/fi';
import axios from 'axios';
import { fixAdminAuth, ensureValidToken } from '../../utils/refreshAdminToken';

// Configuration API
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Client API avec gestion d'authentification
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Intercepteur pour l'authentification (même que CourseManagement)
api.interceptors.request.use(config => {
  let token = localStorage.getItem('adminToken');
  
  // Si le token n'est pas valide, essayer de le rafraîchir
  if (!token || token === 'undefined' || token === 'null') {
    token = ensureValidToken();
    if (token) {
      localStorage.setItem('adminToken', token);
    }
  }
  
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✅ Token admin ajouté à la requête:', config.url);
  } else {
    console.error('❌ Aucun token admin valide pour la requête:', config.url);
  }
  
  return config;
});

// Intercepteur pour la gestion des erreurs (simplifié comme CourseManagement)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.log('Erreur d\'authentification:', error.response?.data?.message);
      toast.error('Erreur d\'authentification. Vérifiez votre connexion.');
    }
    return Promise.reject(error);
  }
);

// Styles
const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: #f8fafc;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  margin: 0;
  color: #1f2937;
  font-size: 1.875rem;
  font-weight: 700;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.active ? '#3b82f6' : '#f3f4f6'};
  color: ${props => props.active ? 'white' : '#6b7280'};

  &:hover {
    background: ${props => props.active ? '#2563eb' : '#e5e7eb'};
  }
`;

const Button = styled.button`
  background: ${props => props.primary ? '#3b82f6' : props.danger ? '#dc2626' : '#6b7280'};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  font-size: 0.875rem;

  &:hover {
    background: ${props => props.primary ? '#2563eb' : props.danger ? '#b91c1c' : '#4b5563'};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const Card = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const CardTitle = styled.h3`
  margin: 0;
  color: #1f2937;
  font-size: 1.125rem;
  font-weight: 600;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => props.active ? '#dcfce7' : '#fee2e2'};
  color: ${props => props.active ? '#166534' : '#dc2626'};
`;

const CardContent = styled.div`
  margin-bottom: 1rem;
`;

const Price = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const Type = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  color: #4b5563;
  font-size: 0.875rem;
  margin: 0.5rem 0;
  line-height: 1.5;
`;

const Stats = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

const IconButton = styled.button`
  background: none;
  border: 1px solid #d1d5db;
  color: #6b7280;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    color: #374151;
  }

  &.danger:hover {
    background: #fee2e2;
    color: #dc2626;
    border-color: #fca5a5;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 700px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  min-height: 80px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Checkbox = styled.input`
  width: 1rem;
  height: 1rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.1rem;
  color: #6b7280;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #fca5a5;
`;

const SuccessMessage = styled.div`
  background: #dcfce7;
  color: #166534;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #bbf7d0;
`;

const SubscriptionManagement = () => {
  const [activeTab, setActiveTab] = useState('category-plans');
  const [plans, setPlans] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    categoryId: '',
    price: '',
    currency: 'TND',
    paymentType: 'one_time',
    accessDuration: 365,
    active: true,
    translations: {
      fr: { name: '', description: '' },
      en: { name: '', description: '' },
      ar: { name: '', description: '' }
    },
    features: [],
    order: 0
  });
  const [newFeature, setNewFeature] = useState('');
  const [stats, setStats] = useState({
    totalPlans: 0,
    activePlans: 0,
    totalUsers: 0
  });

  useEffect(() => {
    // Vérification et correction automatique du token admin
    const checkAndFixAuth = async () => {
      console.log('🔍 Vérification de l\'authentification admin...');
      
      let token = ensureValidToken();
      console.log('Token vérifié:', token ? 'Valide' : 'Invalide');
      
      if (!token) {
        // Si le token n'est pas valide, essayer de le rafraîchir
        token = localStorage.getItem('adminToken');
        if (!token || token === 'undefined' || token === 'null') {
          console.error('❌ Aucun token admin trouvé');
          toast.error('Erreur d\'authentification. Veuillez vous reconnecter.');
          return;
        }
      }
      
      // S'assurer que le token est bien dans localStorage
      if (token) {
        localStorage.setItem('adminToken', token);
        console.log('✅ Token admin stocké dans localStorage');
      }
      
      // Attendre un peu pour s'assurer que le token est bien mis à jour
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Vérifier une dernière fois que le token est présent
      const finalToken = localStorage.getItem('adminToken');
      if (!finalToken || finalToken === 'undefined' || finalToken === 'null') {
        console.error('❌ Token admin toujours absent après vérification');
        toast.error('Erreur d\'authentification. Veuillez vous reconnecter.');
        return;
      }
      
      if (activeTab === 'category-plans') {
        fetchCategoryPlansData();
      }
    };
    
    checkAndFixAuth();
  }, [activeTab]);

  const fetchCategoryPlansData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Chargement des données des plans de catégories...');
      
      // Récupérer les deux types de catégories (classic et specific) comme dans CourseManagement
      const [plansRes, classicRes, specificRes] = await Promise.all([
        api.get('/api/admin/category-plans'),
        api.get('/api/courses/categories?type=classic'),
        api.get('/api/courses/categories?type=specific')
      ]);
      
      const classic = Array.isArray(classicRes?.data) ? classicRes.data : [];
      const specific = Array.isArray(specificRes?.data) ? specificRes.data : [];
      const allCategories = [...classic, ...specific];
      
      console.log('✅ Données chargées:', { 
        plans: plansRes.data?.plans?.length || 0,
        classicCategories: classic.length,
        specificCategories: specific.length,
        totalCategories: allCategories.length
      });
      
      setPlans(plansRes.data?.plans || []);
      setCategories(allCategories);
      setStats({
        totalPlans: plansRes.data?.plans?.length || 0,
        activePlans: (plansRes.data?.plans || []).filter(p => p.active).length,
        totalUsers: (plansRes.data?.plans || []).reduce((sum, p) => sum + (p.activeUsersCount || 0), 0)
      });
      
      setSuccess('Données chargées avec succès');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error);
      
      if (error.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter en tant qu\'administrateur.');
        toast.error('Session expirée. Veuillez vous reconnecter.');
      } else {
        setError(error.response?.data?.message || 'Erreur lors du chargement des données');
        toast.error('Erreur lors du chargement des données');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPlan(null);
    setFormData({
      categoryId: '',
      price: '',
      currency: 'TND',
      paymentType: 'one_time',
      accessDuration: 365,
      active: true,
      translations: {
        fr: { name: '', description: '' },
        en: { name: '', description: '' },
        ar: { name: '', description: '' }
      },
      features: [],
      order: 0
    });
    setModalOpen(true);
  };

  const handleEdit = (plan) => {
    console.log('✏️ Édition du plan:', plan);
    setEditingPlan(plan);
    setFormData({
      categoryId: plan.category._id || plan.category,
      price: plan.price,
      currency: plan.currency,
      paymentType: plan.paymentType,
      accessDuration: plan.accessDuration,
      active: plan.active,
      translations: plan.translations || {
        fr: { name: '', description: '' },
        en: { name: '', description: '' },
        ar: { name: '', description: '' }
      },
      features: plan.features || [],
      order: plan.order
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      console.log('💾 Sauvegarde du plan:', formData);
      
      if (editingPlan) {
        await api.put(`/api/admin/category-plans/${editingPlan._id}`, formData);
        toast.success('Plan mis à jour avec succès');
      } else {
        await api.post('/api/admin/category-plans', formData);
        toast.success('Plan créé avec succès');
      }
      
      setModalOpen(false);
      fetchCategoryPlansData();
      
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      setError(error.response?.data?.message || 'Erreur lors de la sauvegarde');
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (plan) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le plan "${plan.translations?.fr?.name || 'Sans nom'}" ?`)) {
      return;
    }

    try {
      console.log('🗑️ Suppression du plan:', plan._id);
      await api.delete(`/api/admin/category-plans/${plan._id}`);
      toast.success('Plan supprimé avec succès');
      fetchCategoryPlansData();
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleToggleStatus = async (plan) => {
    try {
      console.log('🔄 Changement de statut:', plan._id, !plan.active);
      await api.patch(`/api/admin/category-plans/${plan._id}/toggle`, {
        active: !plan.active
      });
      toast.success(`Plan ${!plan.active ? 'activé' : 'désactivé'} avec succès`);
      fetchCategoryPlansData();
    } catch (error) {
      console.error('❌ Erreur lors du changement de statut:', error);
      toast.error('Erreur lors du changement de statut');
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    if (!category) return 'Catégorie inconnue';
    
    const name = category.translations?.fr?.name || category.name || 'Sans nom';
    const type = category.type === 'specific' ? 'Spécifique' : 'Classique';
    return `${name} (${type})`;
  };

  const getPaymentTypeLabel = (type) => {
    switch (type) {
      case 'one_time': return 'Achat unique';
      case 'monthly': return 'Mensuel';
      case 'yearly': return 'Annuel';
      default: return type;
    }
  };

  const renderCategoryPlans = () => {
    if (loading) {
      return (
        <LoadingContainer>
          <FiRefreshCw className="animate-spin" />
          Chargement des plans de catégories...
        </LoadingContainer>
      );
    }

    return (
      <>
        <StatsGrid>
          <StatCard>
            <StatValue>{stats.totalPlans}</StatValue>
            <StatLabel>Plans Total</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.activePlans}</StatValue>
            <StatLabel>Plans Actifs</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.totalUsers}</StatValue>
            <StatLabel>Utilisateurs avec Accès</StatLabel>
          </StatCard>
        </StatsGrid>

        {plans.length === 0 ? (
          <EmptyState>
            <h3>Aucun plan de catégorie</h3>
            <p>Créez votre premier plan pour commencer à monétiser vos catégories.</p>
            <Button primary onClick={handleCreate} style={{ marginTop: '1rem' }}>
              <FiPlus />
              Créer le premier plan
            </Button>
          </EmptyState>
        ) : (
          <Grid>
            {plans.map((plan) => (
              <Card key={plan._id}>
                <CardHeader>
                  <CardTitle>{getCategoryName(plan.category._id || plan.category)}</CardTitle>
                  <StatusBadge active={plan.active}>
                    {plan.active ? 'Actif' : 'Inactif'}
                  </StatusBadge>
                </CardHeader>
                
                <CardContent>
                  <Price>{plan.price} {plan.currency}</Price>
                  <Type>
                    {getPaymentTypeLabel(plan.paymentType)}
                    {plan.paymentType === 'one_time' && ` (${plan.accessDuration} jours)`}
                  </Type>
                  
                  <Description>
                    {plan.translations?.fr?.description || 'Aucune description'}
                  </Description>
                  
                  <Stats>
                    <span>👥 {plan.activeUsersCount || 0} utilisateurs</span>
                    <span>📊 Ordre: {plan.order}</span>
                  </Stats>
                </CardContent>
                
                <CardActions>
                  <IconButton onClick={() => handleEdit(plan)} title="Modifier">
                    <FiEdit />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleToggleStatus(plan)} 
                    title={plan.active ? 'Désactiver' : 'Activer'}
                  >
                    {plan.active ? <FiToggleRight /> : <FiToggleLeft />}
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDelete(plan)} 
                    className="danger"
                    title="Supprimer"
                  >
                    <FiTrash2 />
                  </IconButton>
                </CardActions>
              </Card>
            ))}
          </Grid>
        )}
      </>
    );
  };

  const renderSubscriptionPlans = () => {
    return (
      <EmptyState>
        <h3>Gestion des Abonnements</h3>
        <p>Cette section sera développée prochainement.</p>
        <p>Pour l'instant, utilisez la section "Plans de Catégories" pour gérer les paiements.</p>
      </EmptyState>
    );
  };

  return (
    <Container>
      <Header>
        <Title>Gestion des Abonnements & Paiements</Title>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button 
            onClick={() => {
              console.log('🔧 Correction complète de l\'authentification...');
              const result = fixAdminAuth();
              toast.success(`Authentification corrigée: ${result}`);
            }}
            style={{ background: '#3b82f6', fontSize: '0.75rem' }}
          >
            🔧 Fix Auth
          </Button>
          {activeTab === 'category-plans' && (
            <Button onClick={fetchCategoryPlansData}>
              <FiRefreshCw />
              Actualiser
            </Button>
          )}
          {activeTab === 'category-plans' && (
            <Button primary onClick={handleCreate}>
              <FiPlus />
              Nouveau Plan
            </Button>
          )}
        </div>
      </Header>

      {error && (
        <ErrorMessage>
          {error}
          {error.includes('Session expirée') && (
            <div style={{ marginTop: '1rem' }}>
              <Button 
                primary 
                onClick={() => {
                  localStorage.removeItem('adminToken');
                  localStorage.removeItem('adminData');
                  window.location.href = '/admin/login';
                }}
              >
                Se reconnecter
              </Button>
            </div>
          )}
        </ErrorMessage>
      )}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <TabContainer>
        <Tab 
          active={activeTab === 'category-plans'} 
          onClick={() => setActiveTab('category-plans')}
        >
          <FiCreditCard style={{ marginRight: '0.5rem' }} />
          Plans de Catégories
        </Tab>
        <Tab 
          active={activeTab === 'subscriptions'} 
          onClick={() => setActiveTab('subscriptions')}
        >
          <FiUsers style={{ marginRight: '0.5rem' }} />
          Abonnements
        </Tab>
        <Tab 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')}
        >
          <FiSettings style={{ marginRight: '0.5rem' }} />
          Paramètres
        </Tab>
      </TabContainer>

      {activeTab === 'category-plans' && renderCategoryPlans()}
      {activeTab === 'subscriptions' && renderSubscriptionPlans()}
      {activeTab === 'settings' && (
        <EmptyState>
          <h3>Paramètres de Paiement</h3>
          <p>Configuration des paramètres de paiement en cours de développement.</p>
        </EmptyState>
      )}

      {modalOpen && (
        <Modal onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {editingPlan ? 'Modifier le Plan' : 'Nouveau Plan'}
              </ModalTitle>
              <CloseButton onClick={() => setModalOpen(false)}>×</CloseButton>
            </ModalHeader>
            
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Catégorie *</Label>
                <Select
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  required
                  disabled={!!editingPlan}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.translations?.fr?.name || category.name} 
                      ({category.type === 'specific' ? 'Spécifique' : 'Classique'})
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormGroup>
                  <Label>Prix *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Devise</Label>
                  <Select
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  >
                    <option value="TND">TND</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </Select>
                </FormGroup>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormGroup>
                  <Label>Type de Paiement *</Label>
                  <Select
                    value={formData.paymentType}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentType: e.target.value }))}
                    required
                  >
                    <option value="one_time">Achat unique</option>
                    <option value="monthly">Mensuel</option>
                    <option value="yearly">Annuel</option>
                  </Select>
                </FormGroup>
                
                {formData.paymentType === 'one_time' && (
                  <FormGroup>
                    <Label>Durée d'accès (jours)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.accessDuration}
                      onChange={(e) => setFormData(prev => ({ ...prev, accessDuration: parseInt(e.target.value) }))}
                    />
                  </FormGroup>
                )}
              </div>

              <FormGroup>
                <Label>Ordre d'affichage</Label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                />
              </FormGroup>

              <FormGroup>
                <CheckboxLabel>
                  <Checkbox
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  />
                  Plan actif
                </CheckboxLabel>
              </FormGroup>

              <div>
                <h4>Traductions</h4>
                {['fr', 'en', 'ar'].map(lang => (
                  <div key={lang} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                    <h5 style={{ margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>{lang}</h5>
                    <FormGroup>
                      <Label>Nom</Label>
                      <Input
                        value={formData.translations[lang]?.name || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          translations: {
                            ...prev.translations,
                            [lang]: { ...prev.translations[lang], name: e.target.value }
                          }
                        }))}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Description</Label>
                      <TextArea
                        value={formData.translations[lang]?.description || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          translations: {
                            ...prev.translations,
                            [lang]: { ...prev.translations[lang], description: e.target.value }
                          }
                        }))}
                      />
                    </FormGroup>
                  </div>
                ))}
              </div>

              <div>
                <h4>Fonctionnalités</h4>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Ajouter une fonctionnalité"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" onClick={addFeature}>
                    Ajouter
                  </Button>
                </div>
                {formData.features.map((feature, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ flex: 1 }}>{feature}</span>
                    <IconButton type="button" onClick={() => removeFeature(index)}>
                      <FiTrash2 />
                    </IconButton>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <Button type="button" onClick={() => setModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" primary>
                  {editingPlan ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default SubscriptionManagement;