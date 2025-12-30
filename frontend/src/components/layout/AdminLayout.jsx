import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import {
  IconLayoutDashboard,
  IconUsers,
  IconBooks,
  IconDiamond,
  IconRefresh,
  IconCreditCard,
  IconChecklist,
  IconSettings,
  IconChevronLeft,
  IconChevronRight,
  IconLogout,
  IconBell,
  IconUser
} from '@tabler/icons-react';
import { Badge, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { useAuth } from '../../contexts/AuthContext'; // Ensure this path is correct

import logo from '../../assets/icons/logo.png';

// --- Animations ---
const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

// --- Styled Components ---

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: 'Plus Jakarta Sans', sans-serif;
`;

const SidebarContainer = styled.aside`
  width: ${props => props.$collapsed ? '88px' : '280px'};
  background: #0f172a;
  color: #fff;
  display: flex;
  flex-direction: column;
  transition: width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  z-index: 50;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

// Improved Toggle Button - Circular floating style on the border line
const ToggleButton = styled.button`
  position: absolute;
  top: 38px;
  right: -14px; /* Half outside to create that "floating on edge" look */
  width: 28px;
  height: 28px;
  background: #3b82f6;
  border: 4px solid #f8fafc; /* Matches main Background to look like a cutout */
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 60;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);

  &:hover {
    background: #2563eb;
    transform: scale(1.1);
  }
`;

const SidebarHeader = styled.div`
  height: 90px;
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  /* Centering when collapsed */
  padding-left: ${props => props.$collapsed ? '1.5rem' : '2rem'}; 
  justify-content: flex-start;
  margin-bottom: 0.5rem;
  overflow: hidden;
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  white-space: nowrap;
`;

const LogoImg = styled.img`
  width: 36px;
  height: 36px;
  object-fit: contain;
  filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.5));
`;

const BrandName = styled.div`
  display: flex;
  flex-direction: column;
  opacity: ${props => props.$visible ? 1 : 0};
  transform: translateX(${props => props.$visible ? 0 : -10}px);
  transition: all 0.3s ease;
  
  h1 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #fff;
    line-height: 1.2;
  }
  span {
    font-size: 0.75rem;
    color: #94a3b8;
    font-weight: 500;
    letter-spacing: 1px;
  }
`;

const NavList = styled.nav`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 16px;
  overflow-y: auto;
  overflow-x: hidden;
  
  &::-webkit-scrollbar {
    width: 0px;
    background: transparent;
  }
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  color: #94a3b8;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  height: 50px;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
  }

  &.active {
    background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
    color: #ffffff;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }
`;

const NavIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  
  svg {
    width: 22px;
    height: 22px;
    stroke-width: 1.5;
  }
`;

const NavLabel = styled.span`
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.2s;
  display: ${props => props.$visible ? 'block' : 'none'};
`;

const SidebarFooter = styled.div`
  padding: 1.5rem;
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: center;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; 
  height: 100vh;
`;

const TopHeader = styled.header`
  height: 90px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2.5rem;
  z-index: 40;
`;

const PageTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.5px;
  animation: ${slideIn} 0.4s ease-out;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 2rem 2.5rem;
  
  /* Custom Scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 20px;
    border: 2px solid #f8fafc;
  }
`;

// Map routes to titles and icons
const ROUTES = [
  { path: '/admin/dashboard', title: 'Start', icon: IconLayoutDashboard, label: 'Dashboard' },
  { path: '/admin/users', title: 'Utilisateurs', icon: IconUsers, label: 'Utilisateurs' },
  { path: '/admin/courses', title: 'Cours', icon: IconBooks, label: 'Cours' },
  { path: '/admin/plans', title: 'Plans', icon: IconDiamond, label: 'Plans Tarifs' },
  { path: '/admin/Subscription', title: 'Abonnements', icon: IconRefresh, label: 'Abonnements' },
  { path: '/admin/payments', title: 'Paiements', icon: IconCreditCard, label: 'Paiements' },
  { path: '/admin/tasks', title: 'Tâches', icon: IconChecklist, label: 'Tâches' },
  { type: 'divider' },
  { path: '/admin/settings', title: 'Paramètres', icon: IconSettings, label: 'Paramètres' },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, currentUser, logoutClient, loading } = useAuth(); // Retrieve real user data
  const user = admin || currentUser; // Fallback to currentUser if admin is not set
  const logout = logoutClient;

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/admin/login');
    }
  }, [user, loading, navigate]);

  const getCurrentTitle = () => {
    const route = ROUTES.find(r => r.path === location.pathname);
    return route ? route.title : 'Admin Panel';
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Helper to get initials
  const getInitials = () => {
    if (!user) return 'AD';
    const f = user.firstName ? user.firstName[0] : '';
    const l = user.lastName ? user.lastName[0] : '';
    return (f + l).toUpperCase() || 'AD';
  };

  const getFullName = () => {
    if (!user) return 'Admin User';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin User';
  };

  const getEmail = () => {
    return user?.email || 'admin@genesis.com';
  };

  // Determine Role Label
  const getRoleLabel = () => {
    if (!user) return 'Guest';
    if (user.roles && user.roles.includes('admin')) return 'Administrateur';
    return 'Modérateur';
  }

  return (
    <Container>
      <SidebarContainer $collapsed={collapsed}>
        {/* Toggle Button placed on the edge */}
        <ToggleButton onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
        </ToggleButton>

        <SidebarHeader $collapsed={collapsed}>
          <LogoWrapper>
            <LogoImg src={logo} alt="Logo" />
            <BrandName $visible={!collapsed}>
              <h1>Genesis</h1>
              <span>ADMIN</span>
            </BrandName>
          </LogoWrapper>
        </SidebarHeader>

        <NavList>
          {ROUTES.map((route, idx) => {
            if (route.type === 'divider') {
              return <div key={idx} style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '12px 6px' }} />;
            }
            return (
              <NavItem key={route.path} to={route.path} title={collapsed ? route.label : ''}>
                <NavIcon>
                  <route.icon />
                </NavIcon>
                <NavLabel $visible={!collapsed}>{route.label}</NavLabel>
              </NavItem>
            );
          })}
        </NavList>

        <SidebarFooter>
          {!collapsed ? (
            <div className="flex flex-col items-center gap-1 text-xs text-gray-500">
              <span className="font-semibold text-gray-400">Genesis CMS v2.1</span>
              <span>© 2024 CodeGenesis</span>
            </div>
          ) : (
            <span className="text-[10px] text-gray-600 font-mono">v2.1</span>
          )}
        </SidebarFooter>

      </SidebarContainer>

      <MainContent>
        <TopHeader>
          <PageTitle>{getCurrentTitle()}</PageTitle>
          <HeaderActions>
            <div className="relative cursor-pointer hover:bg-slate-100 p-2.5 rounded-full transition-colors group">
              <Badge content="" color="danger" shape="circle" size="sm" className="border-2 border-white">
                <IconBell size={24} className="text-slate-600 group-hover:text-blue-600 transition-colors" />
              </Badge>
            </div>

            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <div className="flex items-center gap-3 cursor-pointer p-1 pr-2 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-800 leading-tight">{getFullName()}</p>
                    <p className="text-xs text-slate-500 font-medium">{getRoleLabel()}</p>
                  </div>
                  <Avatar
                    isBordered
                    color="primary"
                    name={getInitials()}
                    src={user?.avatar} // Assuming user object might have an avatar URL
                    className="transition-transform"
                    size="sm"
                  />
                </div>
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2" textValue="Profil">
                  <p className="font-semibold">Connecté en tant que</p>
                  <p className="font-semibold text-blue-600">{getEmail()}</p>
                </DropdownItem>
                <DropdownItem key="settings" startContent={<IconSettings size={18} />} onPress={() => navigate('/admin/settings')}>
                  Mes Paramètres
                </DropdownItem>
                <DropdownItem key="dashboard" startContent={<IconLayoutDashboard size={18} />} onPress={() => navigate('/admin/dashboard')}>
                  Tableau de Bord
                </DropdownItem>
                <DropdownItem key="logout" color="danger" startContent={<IconLogout size={18} />} onPress={handleLogout}>
                  Se déconnecter
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </HeaderActions>
        </TopHeader>

        <ScrollableContent>
          <Outlet />
        </ScrollableContent>
      </MainContent>
    </Container>
  );
}