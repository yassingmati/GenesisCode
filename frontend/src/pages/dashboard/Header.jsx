import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from '../../hooks/useTranslation';
import LanguageSelector from '../../components/LanguageSelector';
import { getApiUrl } from '../../utils/apiConfig';
import {
    Navbar,
    NavbarContent,
    NavbarItem,
    Button,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Avatar,
    Badge,
    Input
} from "@nextui-org/react";
import {
    IconMenu2,
    IconBell,
    IconSearch,
    IconLogout,
    IconUser,
    IconSettings,
    IconHelp
} from '@tabler/icons-react';

const API_BASE = getApiUrl('/api');

function getAuthHeader() {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

import ThemeToggle from '../../components/ThemeToggle';

// ... imports

export default function Header({ toggleSidebar, collapsed, toggleMobileMenu, setActivePage }) {
    const { t } = useTranslation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(`${API_BASE}/notifications`, { headers: getAuthHeader() });
            if (Array.isArray(res.data)) {
                setNotifications(res.data);
                setUnreadCount(res.data.filter(n => !n.read).length);
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await axios.put(`${API_BASE}/notifications/${id}/read`, {}, { headers: getAuthHeader() });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    useEffect(() => {
        let mounted = true;

        async function loadUserProfile() {
            try {
                const res = await axios.get(`${API_BASE}/users/profile`, { headers: getAuthHeader() });
                if (mounted) {
                    const userData = res.data.user || res.data;
                    setUser(userData);
                }
            } catch (err) {
                console.error('Erreur lors du chargement du profil:', err);
                try {
                    const storedUser = localStorage.getItem('user');
                    if (storedUser && mounted) {
                        setUser(JSON.parse(storedUser));
                    }
                } catch (e) {
                    console.error('Impossible de parser les données utilisateur:', e);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadUserProfile();
        fetchNotifications();
        // Poll notifications every minute
        const notifInterval = setInterval(fetchNotifications, 60000);

        return () => {
            mounted = false;
            clearInterval(notifInterval);
        };
    }, []);

    const doLogout = () => {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
        } catch (e) {
            // ignore
        }
        window.location.href = '/login';
    };

    return (
        <Navbar
            maxWidth="full"
            position="sticky"
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-700/50 h-20 transition-colors duration-300"
        >
            {/* Mobile Menu Toggle */}
            <NavbarContent className="lg:hidden" justify="start">
                <Button isIconOnly variant="light" onPress={toggleMobileMenu}>
                    <IconMenu2 className="text-slate-700 dark:text-slate-200" />
                </Button>
            </NavbarContent>

            {/* Search Bar Removed */}


            {/* Right Actions */}
            <NavbarContent justify="end" className="gap-4">
                {/* Theme Toggle */}
                <NavbarItem>
                    <ThemeToggle />
                </NavbarItem>

                {/* Language Selector */}
                <NavbarItem className="hidden sm:flex">
                    <LanguageSelector showLabel={false} size="small" />
                </NavbarItem>

                {/* Notifications */}
                <NavbarItem>
                    <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                            <div className="cursor-pointer">
                                <Badge content={unreadCount > 0 ? unreadCount : null} color="danger" shape="circle" size="sm">
                                    <Button isIconOnly radius="full" variant="light">
                                        <IconBell size={24} className="text-gray-600 dark:text-slate-300" />
                                    </Button>
                                </Badge>
                            </div>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label="Notifications"
                            className="w-80 max-h-96 overflow-y-auto dark:bg-slate-800 dark:text-white"
                            itemClasses={{
                                base: "gap-4",
                            }}
                        >
                            <DropdownItem key="title" className="h-10 gap-2 opacity-100 cursor-default" isReadOnly>
                                <p className="font-semibold">Notifications</p>
                            </DropdownItem>

                            {notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <DropdownItem
                                        key={notif._id}
                                        className={`py-3 ${!notif.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                        description={new Date(notif.createdAt).toLocaleDateString()}
                                        startContent={
                                            <div className={`w-2 h-2 rounded-full ${!notif.read ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                        }
                                        onPress={() => handleMarkAsRead(notif._id)}
                                    >
                                        <div className="flex flex-col gap-1">
                                            <span className="font-semibold text-small">{notif.title}</span>
                                            <span className="text-tiny text-default-500">{notif.message}</span>
                                        </div>
                                    </DropdownItem>
                                ))
                            ) : (
                                <DropdownItem key="empty" isReadOnly>
                                    <p className="text-center text-gray-500">Aucune notification</p>
                                </DropdownItem>
                            )}
                        </DropdownMenu>
                    </Dropdown>
                </NavbarItem>

                {/* User Menu */}
                <NavbarItem>
                    <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                            <Avatar
                                isBordered
                                as="button"
                                className="transition-transform"
                                color="secondary"
                                name={user?.firstName ? user.firstName[0] : "U"}
                                size="sm"
                                src={user?.avatar}
                            />
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label="Profile Actions"
                            variant="flat"
                            className="dark:bg-slate-800 dark:text-white"
                            itemClasses={{
                                base: "dark:hover:bg-slate-700 dark:text-slate-200",
                            }}
                        >
                            <DropdownItem key="profile" className="h-14 gap-2" textValue="Profil">
                                <p className="font-semibold">Connecté en tant que</p>
                                <p className="font-semibold">{user?.email}</p>
                            </DropdownItem>
                            <DropdownItem key="settings" startContent={<IconUser size={18} />} onPress={() => setActivePage && setActivePage('profile')}>
                                Mon Profil
                            </DropdownItem>
                            <DropdownItem key="help_and_feedback" startContent={<IconHelp size={18} />}>
                                Aide & Feedback
                            </DropdownItem>
                            <DropdownItem key="logout" color="danger" startContent={<IconLogout size={18} />} onPress={doLogout}>
                                Déconnexion
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </NavbarItem>
            </NavbarContent>
        </Navbar>
    );
}