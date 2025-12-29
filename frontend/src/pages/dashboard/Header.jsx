import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import SubscriptionButton from '../../components/SubscriptionButton';

// ... imports

export default function Header({ toggleSidebar, collapsed, toggleMobileMenu, setActivePage }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
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

    const handleNotificationClick = async (notification) => {
        try {
            // Marquer comme lu
            if (!notification.read) {
                await axios.put(`${API_BASE}/notifications/${notification._id}/read`, {}, { headers: getAuthHeader() });
                setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }

            // Gérer la redirection selon le type
            if (notification.type === 'parent_invitation') {
                navigate('/dashboard?tab=profile&section=family');
            }
        } catch (err) {
            console.error('Error handling notification click:', err);
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
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminData');
        } catch (e) {
            // ignore
        }
        window.location.href = '/login';
    };

    return (
        <Navbar
            maxWidth="full"
            position="sticky"
            className="bg-[#0f0c29]/90 backdrop-blur-md border-b border-white/10 h-20 transition-all duration-300"
            classNames={{
                wrapper: "px-6"
            }}
        >
            {/* Mobile Menu Toggle */}
            <NavbarContent className="md:hidden" justify="start">
                <Button isIconOnly variant="light" onPress={toggleMobileMenu}>
                    <IconMenu2 className="text-white/70" />
                </Button>
            </NavbarContent>

            {/* Logo */}
            <NavbarContent justify="start" className="hidden lg:flex max-w-fit cursor-pointer" onClick={() => window.location.href = '/dashboard'}>
                <p className="font-bold text-inherit text-xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                    CodeGenesis
                </p>
            </NavbarContent>

            {/* Search Bar Removed */}


            {/* Right Actions */}
            <NavbarContent justify="end" className="gap-4">
                {/* Theme Toggle */}
                <NavbarItem>
                    <ThemeToggle />
                </NavbarItem>

                {/* Bouton d'abonnement */}
                <NavbarItem className="hidden sm:flex">
                    <SubscriptionButton
                        variant="premium"
                        className="h-9 px-4 text-small"
                    />
                </NavbarItem>

                {/* Language Selector */}
                <NavbarItem className="hidden sm:flex">
                    <LanguageSelector showLabel={false} size="small" />
                </NavbarItem>

                {/* Notifications */}
                <NavbarItem>
                    <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                            <Button isIconOnly radius="full" variant="light" className="relative overflow-visible text-white/70 hover:text-white hover:bg-white/5">
                                <Badge content={unreadCount > 0 ? unreadCount : null} color="danger" size="sm" shape="circle" className="border-2 border-[#0f0c29]">
                                    <IconBell size={24} />
                                </Badge>
                            </Button>
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
                                        onPress={() => handleNotificationClick(notif)}
                                        textValue={notif.title || "Notification"}
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