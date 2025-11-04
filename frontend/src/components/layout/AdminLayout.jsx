import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

// Animations
const slideIn = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Composants stylisés
const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Sidebar = styled.aside`
  width: 280px;
  background: linear-gradient(135deg, #2c3e50 0%, #1a2530 100%);
  color: #fff;
  padding: 1.5rem 0;
  display: flex;
  flex-direction: column;
  box-shadow: 5px 0 15px rgba(0, 0, 0, 0.1);
  z-index: 10;
  transition: all 0.3s ease;
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: 80px;
    align-items: center;
  }
`;

const SidebarHeader = styled.div`
  padding: 0 1.5rem 1.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  animation: ${slideIn} 0.4s ease-out;
  
  @media (max-width: 768px) {
    padding: 0 0.5rem 1rem;
    text-align: center;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.6rem;
  font-weight: 700;
  color: #fff;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.2rem;
  }
`;

const LogoIcon = styled.div`
  width: 42px;
  height: 42px;
  background: #3498db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  animation: ${pulse} 2s infinite;
`;

const LogoText = styled.span`
  font-size: 1.5rem;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const NavItems = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0 1rem;
`;

const LinkItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  margin: 0.25rem 0;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  animation: ${slideIn} 0.5s ease-out;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    transform: translateX(5px);
  }
  
  &.active {
    background: rgba(52, 152, 219, 0.2);
    color: #fff;
    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
    
    & > div:first-child {
      background: #3498db;
      color: white;
    }
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
    justify-content: center;
    
    & > span {
      display: none;
    }
  }
`;

const LinkIcon = styled.div`
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;
`;

const LinkText = styled.span`
  font-size: 1.05rem;
  font-weight: 500;
`;

const SidebarFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  text-align: center;
  animation: ${slideIn} 0.6s ease-out;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const Content = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  width: 100%;
`;

const Header = styled.header`
  background: #fff;
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 5;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PageTitle = styled.h1`
  color: #2c3e50;
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0;
  animation: ${fadeIn} 0.4s ease-out;
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  animation: ${fadeIn} 0.5s ease-out;
  
  &:hover {
    & > div:first-child {
      transform: scale(1.05);
    }
  }
`;

const Avatar = styled.div`
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #3498db, #9b59b6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
`;

const UserInfo = styled.div`
  text-align: right;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const UserName = styled.div`
  font-weight: 600;
  color: #2c3e50;
`;

const UserRole = styled.div`
  font-size: 0.85rem;
  color: #7f8c8d;
`;

const ContentArea = styled.div`
  padding: 2rem;
  flex: 1;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const CollapseButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: 1rem auto;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(180deg);
  }
  
  @media (min-width: 769px) {
    display: none;
  }
`;

// Tableau de correspondance entre les routes et les titres
const pageTitles = {
  '/admin/dashboard': 'Dashboard Administrateur',
  '/admin/users': 'Gestion des Utilisateurs',
  '/admin/courses': 'Gestion des Cours',
  '/admin/payments': 'Gestion des Paiements',
  '/admin/Subscription': 'Gestion du Subscription',
  '/admin/category-plans': 'Plans de Catégories',
  '/admin/settings': 'Paramètres Administrateur',
};

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  // Obtenir le titre de la page en fonction de l'URL
  const getPageTitle = () => {
    return pageTitles[location.pathname] || 'Dashboard Administrateur';
  };

  return (
    <Container>
      <Sidebar style={{ width: sidebarCollapsed ? '80px' : '280px' }}>
        <SidebarHeader>
          <Logo>
            <LogoIcon>📋</LogoIcon>
            {!sidebarCollapsed && <LogoText>Admin Panel</LogoText>}
          </Logo>
        </SidebarHeader>
        
        <NavItems>
          <LinkItem to="/admin/dashboard">
            <LinkIcon>📊</LinkIcon>
            {!sidebarCollapsed && <LinkText>Dashboard</LinkText>}
          </LinkItem>
          
          <LinkItem to="/admin/users">
            <LinkIcon>👥</LinkIcon>
            {!sidebarCollapsed && <LinkText>User Management</LinkText>}
          </LinkItem>
          
          <LinkItem to="/admin/courses">
            <LinkIcon>📚</LinkIcon>
            {!sidebarCollapsed && <LinkText>Course Management</LinkText>}
          </LinkItem>
          
          <LinkItem to="/admin/payments">
            <LinkIcon>💳</LinkIcon>
            {!sidebarCollapsed && <LinkText>Payment Management</LinkText>}
          </LinkItem>
          
          <LinkItem to="/admin/Subscription">
            <LinkIcon>📝</LinkIcon>
            {!sidebarCollapsed && <LinkText>Subscription Management</LinkText>}
          </LinkItem>
          
          <LinkItem to="/admin/category-plans">
            <LinkIcon>🏷️</LinkIcon>
            {!sidebarCollapsed && <LinkText>Plans de Catégories</LinkText>}
          </LinkItem>
          
          <LinkItem to="/admin/settings">
            <LinkIcon>⚙️</LinkIcon>
            {!sidebarCollapsed && <LinkText>Settings</LinkText>}
          </LinkItem>
        </NavItems>
        
        {!sidebarCollapsed && (
          <SidebarFooter>
            Admin Panel v2.0<br />
            © 2023 - Tous droits réservés
          </SidebarFooter>
        )}
        
        <CollapseButton onClick={toggleSidebar}>
          {sidebarCollapsed ? '➡️' : '⬅️'}
        </CollapseButton>
      </Sidebar>
      
      <Content>
        <Header>
          <PageTitle>{getPageTitle()}</PageTitle>
          <UserProfile>
            <UserInfo>
              <UserName>Alexandre Martin</UserName>
              <UserRole>Administrateur</UserRole>
            </UserInfo>
            <Avatar>AM</Avatar>
          </UserProfile>
        </Header>
        
        <ContentArea>
          {/* Le contenu spécifique à chaque page sera injecté ici */}
          <Outlet />
        </ContentArea>
      </Content>
    </Container>
  );
}