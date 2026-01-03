import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../../pages/dashboard/Sidebar';
import Header from '../../pages/dashboard/Header';
import TimeTracker from '../TimeTracker';

export default function DashboardLayout({ children, activePage, setActivePage }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth < 1024;
        }
        return false;
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                // Mobile: Drawer mode, state doesn't affect collapsed prop as much as CSS
                // keeping it default false for drawer internal logic (expanded inside drawer)
                setSidebarCollapsed(false);
            } else if (window.innerWidth < 1024) {
                // Tablet: Rail mode (Auto collapsed)
                setSidebarCollapsed(true);
            } else {
                // Desktop: Default expanded
                setSidebarCollapsed(false);
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <div className="flex h-screen bg-gradient-to-br from-blue-50/40 via-white to-purple-50/40 dark:from-[#0f0c29] dark:via-[#302b63] dark:to-[#24243e] text-gray-900 dark:text-white lg:overflow-hidden overflow-y-auto transition-colors duration-300">
            <TimeTracker />

            {/* Sidebar */}
            <Sidebar
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
                mobileOpen={isMobileMenuOpen}
                setMobileOpen={setIsMobileMenuOpen}
                activePage={activePage}
                setActivePage={setActivePage}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 lg:overflow-hidden overflow-visible transition-all duration-300">
                <Header
                    toggleSidebar={toggleSidebar}
                    collapsed={sidebarCollapsed}
                    toggleMobileMenu={toggleMobileMenu}
                    setActivePage={setActivePage}
                />

                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    <div className="max-w-7xl mx-auto w-full h-full">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
}
