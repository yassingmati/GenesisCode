import React from 'react';
import { Breadcrumbs, BreadcrumbItem, Button, Spinner, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/react";
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';

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
    isLite = false // For ExercisePage (less padding/hero)
}) {
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Spinner size="lg" color="primary" />
                <p className="text-gray-500 font-medium">Chargement...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
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
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-20 transition-colors duration-300 relative">
            {/* Top Navigation Bar */}
            <Navbar
                maxWidth="xl"
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700"
            >
                <NavbarBrand className="gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
                    <img src={require('../../assets/icons/logo.png')} alt="CodeGenesis" className="h-8 w-auto" />
                    <p className="font-bold text-inherit text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                        GenesisCode
                    </p>
                </NavbarBrand>
                <NavbarContent justify="end">
                    <NavbarItem>
                        <ThemeToggle />
                    </NavbarItem>
                    <NavbarItem>
                        <Button
                            variant="light"
                            color="primary"
                            startContent={<IconArrowLeft size={18} />}
                            onPress={() => backPath ? navigate(backPath) : navigate(-1)}
                            className="font-medium"
                        >
                            {backLabel}
                        </Button>
                    </NavbarItem>
                </NavbarContent>
            </Navbar>

            {/* Hero Section */}
            {!isLite && (
                <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white py-12 px-4 md:px-8 relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl" />

                    <div className="max-w-7xl mx-auto relative z-10">
                        {breadcrumbs.length > 0 && (
                            <Breadcrumbs
                                size="lg"
                                className="mb-6"
                                itemClasses={{
                                    item: "text-white/70 data-[current=true]:text-white",
                                    separator: "text-white/50"
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

                        <div className="text-center md:text-left">
                            <h1 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="text-lg text-blue-100 max-w-2xl leading-relaxed">
                                    {subtitle}
                                </p>
                            )}
                            {heroContent}
                        </div>
                    </div>
                </div>
            )}

            {/* Content Section */}
            <div className={`max-w-7xl mx-auto px-4 md:px-8 relative z-20 ${!isLite ? '-mt-8' : 'pt-8'}`}>
                {children}
            </div>
        </div>
    );
}
