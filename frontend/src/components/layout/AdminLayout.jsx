import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import logo from '../../assets/icons/logo.png'; // Make sure path is correct relative to this file

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
  background: #f0f2f5;
  font-family: 'Plus Jakarta Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Sidebar = styled.aside`
  width: 280px;
  background: #111827;
  color: #fff;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.05);
  z-index: 20;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  border-right: 1px solid rgba(255,255,255,0.05);
  
  @media (max-width: 768px) {
    width: 80px;
    align-items: center;
    padding: 1rem 0.5rem;
  }
`;

const SidebarHeader = styled.div`
  padding: 0 0.5rem 2rem;
  margin-bottom: 0.5rem;
  animation: ${slideIn} 0.4s ease-out;
  display: flex;
  justify-content: center;
  
  @media (max-width: 768px) {
    padding: 0 0 1rem;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.4rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.5px;
  width: 100%;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const LogoImage = styled.img`
  width: 40px;
  height: 40px;
  object-fit: contain;
  /* Removed background/shadow as we use png now, or keep if user wants box */
  /* background: linear-gradient(135deg, #6366f1, #8b5cf6); */ 
  /* border-radius: 12px; */
  /* padding: 4px; */ 
  animation: ${pulse} 3s infinite;
`;

const LogoText = styled.span`
  background: linear-gradient(to right, #fff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const NavItems = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.1);
    border-radius: 4px;
  }
`;

const LinkItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  margin: 0.1rem 0;
  color: #94a3b8;
  text-decoration: none;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 0.95rem;
  border: 1px solid transparent;
  
  &:hover {
    background: rgba(255, 255, 255, 0.03);
    color: #fff;
    transform: translateX(3px);
  }
  
  &.active {
    background: linear-gradient(90deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
    color: #fff;
    border: 1px solid rgba(99, 102, 241, 0.2);
    box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.1);
    
    & > div:first-child {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      box-shadow: 0 4px 12px -2px rgba(99, 102, 241, 0.4);
    }
  }
  
  @media (max-width: 768px) {
    padding: 0.85rem;
    justify-content: center;
    
    & > span {
      display: none;
    }
  }
`;

const LinkIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: all 0.2s ease;
  color: inherit;
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
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  padding: 1rem 2.5rem;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 15;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PageTitle = styled.h1`
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
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
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
`;

const UserInfo = styled.div`
  text-align: right;
  margin-right: 0.5rem;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const UserName = styled.div`
  font-weight: 600;
  color: #0f172a;
  font-size: 0.95rem;
`;

const UserRole = styled.div`
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
  '/admin/dashboard': 'Dashboard',
  '/admin/users': 'Utilisateurs',
  '/admin/courses': 'Cours',
  '/admin/payments': 'Paiements',
  '/admin/Subscription': 'Abonnements',
  '/admin/category-plans': 'Plans Catégories',
  '/admin/tasks': 'Tâches',
  '/admin/settings': 'Paramètres',
};

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const getPageTitle = () => pageTitles[location.pathname] || 'Admin Panel';

  return (
    <Container>
      <Sidebar style={{ width: sidebarCollapsed ? '80px' : '280px' }}>
        <SidebarHeader>
          <Logo>
            <LogoImage src={logo} alt="Genesis Logo" />
            {!sidebarCollapsed && <LogoText>Genesis</LogoText>}
          </Logo>
        </SidebarHeader>

        <NavItems>
          <LinkItem to="/admin/dashboard">
            <LinkIcon>📊</LinkIcon>
            {!sidebarCollapsed && <LinkText>Dashboard</LinkText>}
          </LinkItem>

          <div className="my-2 border-t border-gray-800 mx-4 opacity-50"></div>

          <LinkItem to="/admin/users">
            <LinkIcon>👥</LinkIcon>
            {!sidebarCollapsed && <LinkText>Utilisateurs</LinkText>}
          </LinkItem>

          <LinkItem to="/admin/courses">
            <LinkIcon>📚</LinkIcon>
            {!sidebarCollapsed && <LinkText>Cours</LinkText>}
          </LinkItem>

          <LinkItem to="/admin/plans">
            <LinkIcon>💎</LinkIcon>
            {!sidebarCollapsed && <LinkText>Plans</LinkText>}
          </LinkItem>

          <LinkItem to="/admin/Subscription">
            <LinkIcon>🔄</LinkIcon>
            {!sidebarCollapsed && <LinkText>Abonnements</LinkText>}
          </LinkItem>

          <LinkItem to="/admin/payments">
            <LinkIcon>💳</LinkIcon>
            {!sidebarCollapsed && <LinkText>Paiements</LinkText>}
          </LinkItem>

          <div className="my-2 border-t border-gray-800 mx-4 opacity-50"></div>

          <LinkItem to="/admin/tasks">
            <LinkIcon>✅</LinkIcon>
            {!sidebarCollapsed && <LinkText>Tâches</LinkText>}
          </LinkItem>

          <LinkItem to="/admin/settings">
            <LinkIcon>⚙️</LinkIcon>
            {!sidebarCollapsed && <LinkText>Paramètres</LinkText>}
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