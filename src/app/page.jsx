'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { useRouter } from 'next/navigation';
import LoginModal from '@/components/LoginModal';
import DetailedMatchAnalysis from '@/components/DetailedMatchAnalysis';

export default function LandingPage() {
    const { user } = useAuth();
    const { showLoginModal, setShowLoginModal } = useUI();
    const router = useRouter();
    const [loginMode, setLoginMode] = useState('login'); // 'login' or 'register'
    const [showDemoAnalysis, setShowDemoAnalysis] = useState(false);

    // Demo Match Data for Landing Page
    const demoMatch = {
        id: 'demo-hero',
        sport: 'soccer',
        league: 'LaLiga',
        home: { name: 'Real Madrid', shortName: 'Real Madrid' },
        away: { name: 'FC Barcelona', shortName: 'Barcelona' },
        displayDate: 'Hoy',
        startTime: '21:00',
        venue: 'Santiago Bernabéu'
    };

    const openLogin = () => {
        setLoginMode('login');
        setShowLoginModal(true);
    };

    const openRegister = () => {
        setLoginMode('register');
        setShowLoginModal(true);
    };

    // Redirect if user is logged in
    useEffect(() => {
        if (user) {
            router.push('/app');
        }
    }, [user, router]);

    if (user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden">

            {/* ==================== NAVBAR ==================== */}
            <nav
                className="fixed top-0 left-0 right-0 z-50"
                style={{
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(100, 116, 139, 0.2)'
                }}
            >
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                    <div className="flex items-center justify-between" style={{ height: '72px' }}>
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <img
                                src="/omnibet-logo.png"
                                alt="OmniBet AI"
                                className="w-12 h-12 rounded-xl object-cover"
                                style={{
                                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
                                    border: '2px solid rgba(16, 185, 129, 0.3)'
                                }}
                            />
                            <span className="text-xl font-bold">
                                <span className="text-white">Omni</span>
                                <span style={{ color: '#10b981' }}>Bet</span>
                                <span className="text-gray-500 text-sm ml-1">AI</span>
                            </span>
                        </div>

                        {/* Nav Links - Desktop */}
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#precios" className="text-gray-400 hover:text-white transition-colors font-medium">
                                Precios
                            </a>
                            <a href="#deportes" className="text-gray-400 hover:text-white transition-colors font-medium">
                                Deportes
                            </a>
                            <a href="#como-funciona" className="text-gray-400 hover:text-white transition-colors font-medium">
                                ¿Cómo Funciona?
                            </a>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={openLogin}
                                className="px-5 py-2.5 rounded-xl font-medium transition-all"
                                style={{
                                    color: '#94a3b8',
                                    border: '1px solid rgba(100, 116, 139, 0.3)'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.color = '#ffffff';
                                    e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.6)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.color = '#94a3b8';
                                    e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.3)';
                                }}
                            >
                                Ingresar
                            </button>
                            <button
                                onClick={openRegister}
                                className="px-5 py-2.5 rounded-xl font-semibold transition-all"
                                style={{
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    color: '#ffffff',
                                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                                }}
                            >
                                Registrarse
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ==================== HERO SECTION ==================== */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Subtle Background */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(16,185,129,0.3) 1px, transparent 0)`,
                        backgroundSize: '50px 50px'
                    }}></div>
                </div>

                <div className="relative max-w-6xl w-full px-4 md:px-8 mx-auto text-center">
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-4 mb-12">
                        <img
                            src="/omnibet-logo.png"
                            alt="OmniBet AI"
                            className="w-20 h-20 rounded-2xl object-cover"
                            style={{
                                boxShadow: '0 0 40px rgba(16, 185, 129, 0.5)',
                                border: '3px solid rgba(16, 185, 129, 0.4)'
                            }}
                        />
                        <span className="text-3xl font-bold">
                            <span className="text-white">Omni</span>
                            <span className="text-emerald-400">Bet</span>
                            <span className="text-gray-500 ml-1">AI</span>
                        </span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-6xl md:text-8xl font-black text-white mb-8 leading-none">
                        Predicciones
                        <br />
                        <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                            Deportivas con IA
                        </span>
                    </h1>

                    <p className="text-2xl md:text-3xl text-gray-300 mb-16 font-light" style={{ textAlign: 'center' }}>
                        Análisis inteligente que convierte datos en victorias
                    </p>

                    {/* Stats Row */}
                    <div className="flex flex-wrap justify-center gap-12 mb-16">
                        <div className="text-center">
                            <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
                                82%
                            </div>
                            <div className="text-gray-400 text-lg">Precisión</div>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                                +18.5%
                            </div>
                            <div className="text-gray-400 text-lg">ROI Promedio</div>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                                2.8K+
                            </div>
                            <div className="text-gray-400 text-lg">Usuarios</div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                        <button
                            onClick={openRegister}
                            className="px-12 py-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xl font-bold rounded-2xl shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60 hover:scale-105 transition-all duration-300"
                        >
                            Comenzar Gratis
                        </button>
                        <button
                            onClick={() => setShowDemoAnalysis(true)}
                            className="px-12 py-6 bg-slate-800/50 border border-emerald-500/30 text-emerald-400 text-xl font-bold rounded-2xl hover:bg-slate-800 transition-all hover:scale-105 flex items-center gap-3 justify-center"
                        >
                            <span>👓</span> Ver Análisis Demo
                        </button>
                    </div>
                    <p className="text-gray-500 mt-6">Sin tarjeta de crédito • Cancela cuando quieras</p>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-center">
                    <div className="text-gray-500 text-sm mb-2">Descubre más</div>
                    <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center mx-auto">
                        <div className="w-1 h-3 bg-gray-500 rounded-full mt-2"></div>
                    </div>
                </div>
            </section>

            {/* ==================== PREDICTION EXAMPLE ==================== */}
            <section id="deportes" className="py-32 bg-gradient-to-b from-slate-900 to-slate-800" style={{ marginTop: '150px' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1rem' }}>

                    {/* Section Title */}
                    <div className="text-center mb-16">
                        <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
                            Predicción en Tiempo Real
                        </h2>
                        <p className="text-xl text-gray-400">
                            Así es como la IA analiza cada partido
                        </p>
                    </div>

                    {/* Prediction Card */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 border border-emerald-500/30 shadow-2xl text-center">

                        {/* Header - Centered */}
                        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-10">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                                <span className="text-gray-400 uppercase text-sm tracking-widest">En Vivo</span>
                            </div>
                            <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-full">
                                <span className="text-emerald-400 font-semibold text-sm">Confianza: Alta</span>
                            </div>
                        </div>

                        {/* Match */}
                        <h3 className="text-4xl md:text-5xl font-bold text-white mb-12">
                            Real Madrid <span className="text-gray-600 font-normal">vs</span> Barcelona
                        </h3>

                        {/* Probabilities - Centered Layout with More Spacing */}
                        <div className="w-full mb-12 px-8 flex flex-col items-center" style={{ gap: '40px' }}>
                            {[
                                { team: 'Real Madrid', prob: 65, color: 'emerald' },
                                { team: 'Empate', prob: 25, color: 'blue' },
                                { team: 'Barcelona', prob: 10, color: 'gray' }
                            ].map(({ team, prob, color }) => (
                                <div key={team} className="flex flex-col items-center w-full max-w-lg">
                                    <div className="mb-3 flex items-center justify-center gap-4">
                                        <span className="text-xl font-semibold text-white">{team}</span>
                                        <span className={`text-2xl font-bold ${color === 'emerald' ? 'text-emerald-400' :
                                            color === 'blue' ? 'text-blue-400' : 'text-gray-500'
                                            }`}>{prob}%</span>
                                    </div>
                                    <div className="h-3 bg-slate-700 w-full rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className={`h-full rounded-full ${color === 'emerald' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                                                color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' :
                                                    'bg-gray-500'
                                                }`}
                                            style={{ width: `${prob}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Analysis - Centered */}
                        <div className="pt-8 border-t border-slate-700 max-w-3xl mx-auto">
                            <h4 className="text-lg font-semibold text-white mb-6">Factores Clave:</h4>
                            <div className="grid md:grid-cols-3 gap-6 justify-items-center">
                                <div className="bg-slate-800/50 rounded-xl p-4 w-full">
                                    <div className="text-emerald-400 mb-1 font-bold">✓ Forma</div>
                                    <div className="text-sm text-gray-400">Madrid: 4 victorias</div>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4 w-full">
                                    <div className="text-orange-400 mb-1 font-bold">⚠ Lesiones</div>
                                    <div className="text-sm text-gray-400">Barça: 2 bajas</div>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4 w-full">
                                    <div className="text-blue-400 mb-1 font-bold">📊 Historial</div>
                                    <div className="text-sm text-gray-400">Madrid ganó últimos 3</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== WHY IT WORKS ==================== */}
            <section id="como-funciona" className="pb-32 bg-slate-900" style={{ marginTop: '150px' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1rem' }}>

                    {/* Section Title */}
                    <div className="text-center mb-20">
                        <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
                            ¿Por Qué Funciona?
                        </h2>
                        <p className="text-xl text-gray-400">
                            Inteligencia artificial entrenada con millones de datos
                        </p>
                    </div>

                    {/* Features */}
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border-2 border-emerald-500 rounded-2xl flex items-center justify-center text-4xl mb-6">
                                🎯
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Precisión Comprobada</h3>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                82% de aciertos en más de 10,000 predicciones verificadas
                            </p>
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border-2 border-blue-500 rounded-2xl flex items-center justify-center text-4xl mb-6">
                                📈
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Mayor Retorno</h3>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                Los usuarios reportan 18.5% más ROI vs apuestas manuales
                            </p>
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-600/20 border-2 border-purple-500 rounded-2xl flex items-center justify-center text-4xl mb-6">
                                ⚡
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Datos en Vivo</h3>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                Actualización continua desde 15+ fuentes cada minuto
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== PRICING ==================== */}
            <section id="precios" className="py-32 bg-gradient-to-b from-slate-800 to-slate-900" style={{ marginTop: '150px' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1rem' }}>

                    {/* Section Title */}
                    <div className="text-center mb-32">
                        <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
                            Planes OmniBet
                        </h2>
                        <p className="text-xl text-gray-400">
                            Empieza gratis, paga solo si funciona para ti
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto" style={{ marginTop: '60px' }}>

                        {/* Free */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-8 hover:border-slate-600 transition-all text-center">
                            <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                            <div className="mb-8">
                                <span className="text-5xl font-bold text-white">$0</span>
                                <span className="text-gray-500">/mes</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center justify-center gap-3 text-gray-300">
                                    <span className="text-emerald-400">✓</span>
                                    3 predicciones al mes
                                </li>
                                <li className="flex items-center justify-center gap-3 text-gray-300">
                                    <span className="text-emerald-400">✓</span>
                                    Deportes principales
                                </li>
                                <li className="flex items-center justify-center gap-3 text-gray-500">
                                    <span>✗</span>
                                    Sin análisis avanzado
                                </li>
                            </ul>
                            <button
                                onClick={() => setShowLoginModal(true)}
                                className="w-full py-4 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-all"
                            >
                                Empezar Gratis
                            </button>
                        </div>

                        {/* Pro - Popular */}
                        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border-2 border-emerald-500 rounded-3xl p-8 relative transform md:scale-105 shadow-2xl shadow-emerald-500/20 text-center">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold rounded-full">
                                RECOMENDADO
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                            <div className="mb-8">
                                <span className="text-5xl font-bold text-white">$29</span>
                                <span className="text-gray-400">/mes</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center justify-center gap-3 text-gray-300">
                                    <span className="text-emerald-400">✓</span>
                                    Predicciones ilimitadas
                                </li>
                                <li className="flex items-center justify-center gap-3 text-gray-300">
                                    <span className="text-emerald-400">✓</span>
                                    15+ deportes
                                </li>
                                <li className="flex items-center justify-center gap-3 text-gray-300">
                                    <span className="text-emerald-400">✓</span>
                                    Análisis avanzado IA
                                </li>
                                <li className="flex items-center justify-center gap-3 text-gray-300">
                                    <span className="text-emerald-400">✓</span>
                                    Alertas en tiempo real
                                </li>
                            </ul>
                            <button
                                onClick={() => setShowLoginModal(true)}
                                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/40 hover:shadow-emerald-500/60 transition-all"
                            >
                                Probar 7 Días Gratis
                            </button>
                        </div>

                        {/* Diamond */}
                        <div className="bg-slate-800/50 border border-amber-500/50 rounded-3xl p-8 hover:border-amber-500 transition-all text-center">
                            <h3 className="text-2xl font-bold text-white mb-2">Diamond</h3>
                            <div className="mb-8">
                                <span className="text-5xl font-bold text-white">$99</span>
                                <span className="text-gray-500">/mes</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center justify-center gap-3 text-gray-300">
                                    <span className="text-amber-400">✓</span>
                                    Todo lo de Pro incluido
                                </li>
                                <li className="flex items-center justify-center gap-3 text-gray-300">
                                    <span className="text-amber-400">✓</span>
                                    Picks VIP de alta confianza
                                </li>
                                <li className="flex items-center justify-center gap-3 text-gray-300">
                                    <span className="text-amber-400">✓</span>
                                    Acceso a 30+ deportes
                                </li>
                                <li className="flex items-center justify-center gap-3 text-gray-300">
                                    <span className="text-amber-400">✓</span>
                                    Asesor personal 24/7
                                </li>
                                <li className="flex items-center justify-center gap-3 text-gray-300">
                                    <span className="text-amber-400">✓</span>
                                    Análisis en profundidad
                                </li>
                                <li className="flex items-center justify-center gap-3 text-gray-300">
                                    <span className="text-amber-400">✓</span>
                                    Reportes personalizados
                                </li>
                            </ul>
                            <button
                                onClick={() => setShowLoginModal(true)}
                                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all"
                            >
                                Ir Premium
                            </button>
                        </div>
                    </div>

                    <p className="text-center text-2xl text-emerald-400 font-semibold mt-16">
                        💎 Elige la inversión que transformará tus apuestas
                    </p>
                </div>
            </section>

            {/* ==================== FINAL CTA ==================== */}
            <section className="py-32 bg-slate-900 text-center" style={{ marginTop: '150px' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1rem' }}>
                    <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
                        ¿Listo Para Ganar Más?
                    </h2>
                    <p className="text-2xl text-gray-400 mb-12">
                        Únete a 2,800+ usuarios que ya confían en la IA
                    </p>
                    <button
                        onClick={openRegister}
                        className="px-12 py-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xl font-bold rounded-2xl shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60 hover:scale-105 transition-all duration-300"
                    >
                        Comenzar Ahora Gratis
                    </button>
                </div>
            </section>

            {/* ==================== FOOTER ==================== */}
            <footer className="py-12 bg-slate-950 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                        <div className="text-gray-500">© 2026 OmniBet AI</div>
                        <div className="flex gap-8">
                            <Link href="/terms" className="text-gray-500 hover:text-white transition-colors">Términos</Link>
                            <Link href="/privacy" className="text-gray-500 hover:text-white transition-colors">Privacidad</Link>
                            <Link href="/contact" className="text-gray-500 hover:text-white transition-colors">Contacto</Link>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-slate-800 text-center">
                        <p className="text-yellow-500/70 text-sm">
                            ⚠️ Las apuestas deportivas conllevan riesgo. Juega responsablemente. +18
                        </p>
                    </div>
                </div>
            </footer>

            {/* Login Modal */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                initialMode={loginMode}
            />

            {/* Demo Analysis Modal */}
            {showDemoAnalysis && (
                <DetailedMatchAnalysis
                    match={demoMatch}
                    onClose={() => setShowDemoAnalysis(false)}
                />
            )}
        </div>
    );
}
