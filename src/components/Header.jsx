'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import LoginModal from './LoginModal';
import RiskProfileSelector, { useRiskProfile } from './RiskProfileSelector';

// Admin emails
const ADMIN_EMAILS = ['pablo@admin.com', 'admin@omnibet.ai'];

/**
 * Navigation Header Component with Auth
 */
export default function Header(props) {
    const { user, profile: userProfile, signOut, setShowLoginModal, showLoginModal, getSubscriptionInfo } = useAuth();
    const { profile: riskProfile, updateProfile } = useRiskProfile();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const isAdmin = user && (ADMIN_EMAILS.includes(user.email) || userProfile?.is_admin);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const subscriptionInfo = getSubscriptionInfo ? getSubscriptionInfo() : { tier: 'guest' };

    const navLinks = [
        { href: '/app', label: 'Predicciones', icon: '🎯' },
        { href: '/history', label: 'Historial', icon: '📊' },
        { href: '/private-room', label: 'Sala Privada', icon: '🕵️' },
        { href: '/pricing', label: 'Premium', icon: '💎' },
    ];

    const handleSignOut = async () => {
        await signOut();
        setShowUserMenu(false);
        window.location.href = '/';
    };

    return (
        <>
            <header
                className={`fixed top-10 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? 'bg-black/80 backdrop-blur-xl border-b border-white/10'
                    : 'bg-transparent'
                    }`}
            >
                <div className="w-full mx-auto container-responsive">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center text-xl font-bold text-black">
                                    O
                                </div>
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-green-400 to-cyan-400 blur-lg opacity-50 group-hover:opacity-80 transition-opacity"></div>
                            </div>
                            <div>
                                <span className="text-xl font-bold text-white">Omni</span>
                                <span className="text-xl font-bold text-gradient">Bet</span>
                                <span className="text-xs text-cyan-400 ml-1">AI</span>
                            </div>
                        </Link>

                        {/* Leaderboard Trigger - Mobile & Desktop */}
                        <button
                            onClick={props.onLeaderboardClick}
                            className="hidden md:flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-600/20 to-yellow-500/10 border border-yellow-500/30 rounded-lg ml-6 hover:bg-yellow-500/20 transition-all group"
                        >
                            <span className="text-xl group-hover:scale-110 transition-transform">🏆</span>
                            <span className="text-xs font-bold text-yellow-500">Top Users</span>
                        </button>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1 ml-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="nav-link flex items-center gap-2"
                                >
                                    <span>{link.icon}</span>
                                    <span>{link.label}</span>
                                </Link>
                            ))}
                        </nav>

                        {/* Search Trigger (Desktop) */}
                        <button
                            onClick={props.onSearchClick}
                            className="hidden md:flex items-center gap-2 px-3 py-2 mr-4 bg-gray-800/50 hover:bg-gray-700/80 rounded-lg text-gray-400 hover:text-white transition-all border border-gray-700 hover:border-gray-500 group"
                        >
                            <span className="text-lg group-hover:scale-110 transition-transform">🔍</span>
                            <span className="text-sm">Buscar...</span>
                            <div className="flex items-center gap-1 ml-2">
                                <kbd className="hidden lg:inline-block px-1.5 py-0.5 bg-gray-900 rounded text-[10px] font-mono border border-gray-700">⌘K</kbd>
                            </div>
                        </button>

                        {/* Risk Profile Selector (Desktop) */}
                        <div className="hidden md:block mr-4">
                            <RiskProfileSelector
                                currentProfile={riskProfile}
                                onUpdate={updateProfile}
                            />
                        </div>

                        {/* Auth Section */}
                        <div className="hidden md:flex items-center gap-4">
                            {user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-3 bg-gray-800/50 hover:bg-gray-700/50 
                                                 rounded-xl px-4 py-2 transition-all"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 
                                                      flex items-center justify-center text-sm font-bold text-black">
                                            {user.email?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm text-white font-medium">
                                                {userProfile?.name || user.email?.split('@')[0]}
                                            </div>
                                            <div className={`text-xs ${subscriptionInfo.tier === 'diamond' ? 'text-cyan-400' :
                                                subscriptionInfo.tier === 'gold' ? 'text-yellow-400' : 'text-gray-400'
                                                }`}>
                                                {subscriptionInfo.tier === 'diamond' ? '💎 Diamond' :
                                                    subscriptionInfo.tier === 'gold' ? '⭐ Gold' : '🆓 Free'}
                                            </div>
                                        </div>
                                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* User Dropdown Menu */}
                                    {showUserMenu && (
                                        <div className="absolute right-0 top-full mt-2 w-64 glass-card p-2 animate-fadeIn">
                                            {/* Subscription Status */}
                                            <div className="p-3 border-b border-gray-700/50">
                                                <div className="text-xs text-gray-400 mb-1">Tu plan:</div>
                                                <div className={`font-bold ${subscriptionInfo.tier === 'diamond' ? 'text-cyan-400' :
                                                    subscriptionInfo.tier === 'gold' ? 'text-yellow-400' : 'text-gray-300'
                                                    }`}>
                                                    {subscriptionInfo.tier === 'free' ? 'Free' :
                                                        subscriptionInfo.tier.charAt(0).toUpperCase() + subscriptionInfo.tier.slice(1)}
                                                </div>
                                                {subscriptionInfo.tier === 'free' && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {subscriptionInfo.remaining || 0} predicciones restantes este mes
                                                    </div>
                                                )}
                                            </div>

                                            <Link
                                                href="/history"
                                                className="flex items-center gap-3 p-3 hover:bg-gray-700/50 rounded-lg transition-all"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <span>📊</span>
                                                <span className="text-white">Mi Historial</span>
                                            </Link>

                                            {subscriptionInfo.tier === 'free' && (
                                                <Link
                                                    href="/pricing"
                                                    className="flex items-center gap-3 p-3 hover:bg-gray-700/50 rounded-lg transition-all"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <span>⬆️</span>
                                                    <span className="text-gradient font-medium">Upgrade a Premium</span>
                                                </Link>
                                            )}

                                            {/* Admin Link */}
                                            {isAdmin && (
                                                <Link
                                                    href="/admin"
                                                    className="flex items-center gap-3 p-3 hover:bg-red-500/10 rounded-lg transition-all"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <span>⚙️</span>
                                                    <span className="text-red-400 font-medium">Panel Admin</span>
                                                </Link>
                                            )}

                                            <button
                                                onClick={handleSignOut}
                                                className="w-full flex items-center gap-3 p-3 hover:bg-red-500/10 rounded-lg 
                                                         transition-all text-red-400"
                                            >
                                                <span>🚪</span>
                                                <span>Cerrar Sesión</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setShowLoginModal(true)}
                                        className="btn-secondary text-sm"
                                    >
                                        Iniciar Sesión
                                    </button>
                                    <Link href="/pricing" className="btn-primary text-sm">
                                        Comenzar Gratis
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden text-white p-2"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-white/10">
                            <nav className="flex flex-col gap-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="nav-link flex items-center gap-2 py-3"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <span>{link.icon}</span>
                                        <span>{link.label}</span>
                                    </Link>
                                ))}
                                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/10">
                                    {user ? (
                                        <>
                                            <div className="text-sm text-gray-400 mb-2">
                                                Conectado como: {user.email}
                                            </div>
                                            <button
                                                onClick={handleSignOut}
                                                className="btn-secondary text-sm w-full"
                                            >
                                                Cerrar Sesión
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setShowLoginModal(true);
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                className="btn-secondary text-sm w-full"
                                            >
                                                Iniciar Sesión
                                            </button>
                                            <Link href="/pricing" className="btn-primary text-sm text-center">
                                                Comenzar Gratis
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </nav>
                        </div>
                    )}
                </div>
            </header>

            {/* Login Modal */}
            {showLoginModal && (
                <LoginModal onClose={() => setShowLoginModal(false)} />
            )}
        </>
    );
}
