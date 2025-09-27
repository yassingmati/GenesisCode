// src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="main-content">
        <Sidebar />
        <div className="content-wrapper">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;