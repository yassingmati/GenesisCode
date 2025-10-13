// src/contexts/ParentContext.jsx
import React, { createContext, useContext, useReducer } from 'react';

const ParentContext = createContext();

const initialState = {
  children: [],
  selectedChild: null,
  controls: {},
  analytics: {},
  calendar: {
    events: [],
    goals: []
  },
  reports: {
    overall: null,
    comparison: null
  },
  loading: false,
  error: null,
  lastUpdate: null
};

const parentReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_CHILDREN':
      return { 
        ...state, 
        children: action.payload,
        lastUpdate: new Date()
      };
    
    case 'SET_SELECTED_CHILD':
      return { 
        ...state, 
        selectedChild: action.payload,
        controls: {},
        analytics: {}
      };
    
    case 'SET_CONTROLS':
      return { 
        ...state, 
        controls: action.payload,
        lastUpdate: new Date()
      };
    
    case 'SET_ANALYTICS':
      return { 
        ...state, 
        analytics: action.payload,
        lastUpdate: new Date()
      };
    
    case 'SET_CALENDAR':
      return { 
        ...state, 
        calendar: {
          ...state.calendar,
          ...action.payload
        },
        lastUpdate: new Date()
      };
    
    case 'SET_REPORTS':
      return { 
        ...state, 
        reports: {
          ...state.reports,
          ...action.payload
        },
        lastUpdate: new Date()
      };
    
    case 'SET_ERROR':
      return { 
        ...state, 
        error: action.payload,
        loading: false
      };
    
    case 'CLEAR_ERROR':
      return { 
        ...state, 
        error: null
      };
    
    case 'RESET':
      return initialState;
    
    default:
      return state;
  }
};

export const ParentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(parentReducer, initialState);
  
  return (
    <ParentContext.Provider value={{ state, dispatch }}>
      {children}
    </ParentContext.Provider>
  );
};

export const useParent = () => {
  const context = useContext(ParentContext);
  if (!context) {
    throw new Error('useParent must be used within a ParentProvider');
  }
  return context;
};

// Hooks spécialisés
export const useParentChildren = () => {
  const { state, dispatch } = useParent();
  
  const loadChildren = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE_URL}/api/parent/children`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des enfants');
      }
      
      const data = await response.json();
      dispatch({ type: 'SET_CHILDREN', payload: data });
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  return {
    children: state.children,
    loading: state.loading,
    error: state.error,
    loadChildren
  };
};

export const useParentControls = () => {
  const { state, dispatch } = useParent();
  
  const loadControls = async (childId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE_URL}/api/parent/children/${childId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des contrôles');
      }
      
      const data = await response.json();
      dispatch({ type: 'SET_CONTROLS', payload: data.controls });
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const updateControls = async (childId, controls) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE_URL}/api/parent/children/${childId}/controls`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ parentalControls: controls })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour des contrôles');
      }
      
      const data = await response.json();
      dispatch({ type: 'SET_CONTROLS', payload: data.controls });
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const applyTemplate = async (childId, template) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE_URL}/api/parent/children/${childId}/apply-template`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ template })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'application du template');
      }
      
      const data = await response.json();
      dispatch({ type: 'SET_CONTROLS', payload: data.controls });
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  return {
    controls: state.controls,
    loading: state.loading,
    error: state.error,
    loadControls,
    updateControls,
    applyTemplate
  };
};

export const useParentAnalytics = () => {
  const { state, dispatch } = useParent();
  
  const loadAnalytics = async (childId, period = 'week') => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE_URL}/api/parent/children/${childId}/analytics?period=${period}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des analytics');
      }
      
      const data = await response.json();
      dispatch({ type: 'SET_ANALYTICS', payload: data });
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  return {
    analytics: state.analytics,
    loading: state.loading,
    error: state.error,
    loadAnalytics
  };
};

export const useParentCalendar = () => {
  const { state, dispatch } = useParent();
  
  const loadCalendar = async (childId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE_URL}/api/calendar/${childId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du calendrier');
      }
      
      const data = await response.json();
      dispatch({ type: 'SET_CALENDAR', payload: data });
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  return {
    calendar: state.calendar,
    loading: state.loading,
    error: state.error,
    loadCalendar
  };
};

export const useParentReports = () => {
  const { state, dispatch } = useParent();
  
  const loadOverallReport = async (period = 'week') => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE_URL}/api/reports/overall?period=${period}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du rapport global');
      }
      
      const data = await response.json();
      dispatch({ type: 'SET_REPORTS', payload: { overall: data } });
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const loadComparisonReport = async (period = 'week') => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE_URL}/api/reports/comparison?period=${period}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du rapport comparatif');
      }
      
      const data = await response.json();
      dispatch({ type: 'SET_REPORTS', payload: { comparison: data } });
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  return {
    reports: state.reports,
    loading: state.loading,
    error: state.error,
    loadOverallReport,
    loadComparisonReport
  };
};
