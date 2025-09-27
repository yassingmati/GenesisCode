// src/pages/CourseManagement/styles.js
import styled, { keyframes } from 'styled-components';

export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const Page = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(180deg, #f6f8ff 0%, #f8fafc 100%);
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  color: #223;
`;

export const Sidebar = styled.aside`
  width: 260px;
  min-width: 220px;
  background: #fff;
  border-right: 1px solid #eceef6;
  padding: 20px;
  box-shadow: 0 6px 18px rgba(46, 54, 77, 0.04);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
`;

export const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
`;

export const NavItem = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  border: 0;
  cursor: pointer;
  background: ${({ active }) => active ? '#f0f4ff' : 'transparent'};
  color: ${({ active }) => active ? '#2b49ee' : '#394867'};
  font-weight: 600;
  &:hover {
    background: #f7f9ff;
  }
`;

export const Main = styled.main`
  flex: 1;
  padding: 28px;
`;

export const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
`;

export const Controls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

export const Search = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e9eef9;
  input {
    border: 0;
    outline: none;
    min-width: 220px;
    font-size: 0.95rem;
    color: #223;
    background: transparent;
  }
`;

export const ActionPrimary = styled.button`
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 10px 14px;
  background: #2b49ee;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(43, 73, 238, 0.12);
  &:hover {
    transform: translateY(-1px);
  }
`;

export const Panel = styled.section`
  background: #fff;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 8px 28px rgba(36, 49, 88, 0.04);
  border: 1px solid #eef1ff;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
  margin-top: 16px;
`;

export const Card = styled.div`
  background: linear-gradient(180deg, #fff, #fbfdff);
  border-radius: 10px;
  padding: 12px;
  border: 1px solid #f1f5ff;
  min-height: 95px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  &:hover {
    box-shadow: 0 8px 30px rgba(36, 49, 88, 0.06);
    transform: translateY(-4px);
    transition: all 0.2s ease;
  }
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
`;

export const CardTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  color: #112;
`;

export const CardMeta = styled.div`
  color: #6b7280;
  font-size: 0.85rem;
`;

export const CardActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

export const IconButton = styled.button`
  padding: 8px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ danger }) => danger ? '#fff5f6' : '#fbfdff'};
  color: ${({ danger }) => danger ? '#d23' : '#344'};
  border: 1px solid #f1f5ff;
`;

export const Tiny = styled.span`
  font-size: 0.85rem;
  color: #657;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #6b7280;
`;

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 8px;
  font-size: 12px;
  background: #f1f5ff;
  color: #2b49ee;
  border: 1px solid #e6edff;
  margin-left: 6px;
`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(12, 18, 34, 0.44);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
`;

export const Modal = styled.div`
  width: min(920px, calc(100% - 40px));
  max-height: 90vh;
  overflow: auto;
  border-radius: 12px;
  background: #fff;
  padding: 20px;
`;