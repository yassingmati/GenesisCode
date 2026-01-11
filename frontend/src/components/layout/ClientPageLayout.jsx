import React from 'react';
import { Breadcrumbs, BreadcrumbItem, Button, Spinner, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/react";
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';
import LanguageSelector from '../LanguageSelector';

/**
 * ClientPageLayout - Shared layout for all client-facing learning pages
 * Ensures consistent gradient branding, typography, and spacing.
 */
export default function ClientPageLayout({
    children,
    title,
    subtitle,
    breadcrumbs = [],
    loading = false,
    error = null,
    onRetry = null,
    showBackButton = true,
    backPath = null,
    backLabel = "Retour",
    heroContent = null,
    isLite = false, // For ExercisePage (less padding/hero)
    fullWidth = false,
    className = ""
}) {
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className={`flex flex-col items-center justify-center min-h-[60vh] gap-4 ${className}`}>
                <Spinner size="lg" color="primary" />
                <p className="text-gray-500 font-medium">Chargement...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`flex flex-col items-center justify-center min-h-[50vh] p-6 text-center ${className}`}>
                <div className="text-red-500 text-xl font-bold mb-4">{error}</div>
                {onRetry && (
                    <Button color="primary" variant="flat" onPress={onRetry}>
                        Réessayer
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-gray-50 dark:bg-slate-900 pb-20 transition-colors duration-300 relative ${className}`}>
            {/* Top Navigation Bar */}
            <Navbar
                maxWidth="xl"
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 z-50"
            >
                <NavbarBrand className="gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
                    <img src={require('../../assets/images/logo-removebg-preview.png')} alt="CodeGenesis" className="h-9 w-auto hover:scale-105 transition-transform" />
                    <p className="font-bold text-inherit text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-500 hidden sm:block">
                        GenesisCode
                    </p>
                </NavbarBrand>
                <NavbarContent justify="end">
                    <NavbarItem>
                        <ThemeToggle />
                    </NavbarItem>
                    <NavbarItem>
                        <LanguageSelector showLabel={false} size="small" />
                    </NavbarItem>
                    <NavbarItem>
                        <Button
                            variant="light"
                            color="primary"
                            startContent={<IconArrowLeft size={18} />}
                            onPress={() => backPath ? navigate(backPath) : navigate(-1)}
                            className="font-medium text-gray-600 dark:text-gray-300"
                        >
                            {backLabel}
                        </Button>
                    </NavbarItem>
                </NavbarContent>
            </Navbar>

            {/* Hero Section */}
            {!isLite && (
                <div className="relative py-16 md:py-24 overflow-hidden">
                    {/* Background with Modern Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-black z-0" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0"></div>

                    {/* Abstract Shapes */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 animate-pulse delay-1000"></div>

                    <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
                        {breadcrumbs.length > 0 && (
                            <Breadcrumbs
                                size="lg"
                                className="mb-6"
                                itemClasses={{
                                    item: "text-white/60 data-[current=true]:text-white hover:text-white transition-colors",
                                    separator: "text-white/40"
                                }}
                            >
                                {breadcrumbs.map((crumb, index) => (
                                    <BreadcrumbItem
                                        key={index}
                                        onPress={crumb.path ? () => navigate(crumb.path) : undefined}
                                        isCurrent={index === breadcrumbs.length - 1}
                                    >
                                        {crumb.label}
                                    </BreadcrumbItem>
                                ))}
                            </Breadcrumbs>
                        )}

                        <div className="text-center md:text-left space-y-4">
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white drop-shadow-lg">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="text-lg md:text-xl text-blue-100/90 max-w-2xl leading-relaxed font-light">
                                    {subtitle}
                                </p>
                            )}
                            {heroContent}
                        </div>
                    </div>
                </div>
            )}

            {/* Content Section */}
            <div className={`${fullWidth ? 'w-full px-0' : 'max-w-7xl mx-auto px-4 md:px-8'} relative z-20 ${!isLite ? '-mt-10' : ''}`}>
                {children}
            </div>
        </div>
    );
}
