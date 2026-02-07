'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LoginModal({ isOpen, onClose, initialMode = 'login' }) {
    const { signIn, signUp, signInWithGoogle, isDemoMode } = useAuth();
    const [mode, setMode] = useState(initialMode);

    // Update mode when initialMode changes (when modal opens)
    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
        }
    }, [isOpen, initialMode]);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Don't render if not open
    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (mode === 'login') {
                await signIn(email, password);
                // Redirect to app after successful login
                window.location.href = '/app';
            } else {
                await signUp(email, password, name);
                if (isDemoMode) {
                    // Demo mode: redirect immediately
                    window.location.href = '/app';
                } else {
                    setSuccess('¡Cuenta creada! Revisa tu email para confirmar.');
                    setLoading(false);
                    return;
                }
            }
            onClose?.();
        } catch (err) {
            setError(err.message || 'Error de autenticación');
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
            // Redirect to app after successful Google login
            window.location.href = '/app';
        } catch (err) {
            setError(err.message || 'Error con Google');
        }
    };

    const fillDemoCredentials = (type) => {
        if (type === 'user') {
            setEmail('demo@test.com');
            setPassword('123456');
        } else {
            setEmail('admin@omnibet.ai');
            setPassword('admin123');
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => e.target === e.currentTarget && onClose?.()}
        >
            <div
                className="relative w-full max-w-xl overflow-hidden"
                style={{
                    background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)',
                    borderRadius: '24px',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(16, 185, 129, 0.1)'
                }}
            >
                {/* Header Gradient Bar */}
                <div
                    style={{
                        height: '4px',
                        background: 'linear-gradient(90deg, #10b981, #06b6d4, #8b5cf6)'
                    }}
                />

                {/* Content */}
                <div style={{ padding: '48px' }}>
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full transition-all"
                        style={{
                            backgroundColor: 'rgba(100, 116, 139, 0.2)',
                            color: '#94a3b8'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                            e.currentTarget.style.color = '#f87171';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(100, 116, 139, 0.2)';
                            e.currentTarget.style.color = '#94a3b8';
                        }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Logo & Header */}
                    <div className="text-center" style={{ marginBottom: '40px' }}>
                        <div
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                            style={{
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
                                border: '2px solid rgba(16, 185, 129, 0.4)'
                            }}
                        >
                            <span className="text-3xl">🧠</span>
                        </div>
                        <h2
                            className="text-3xl font-bold mb-2"
                            style={{
                                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            {mode === 'login' ? 'Bienvenido de Vuelta' : 'Únete a OmniBet'}
                        </h2>
                        <p style={{ color: '#94a3b8' }}>
                            {mode === 'login'
                                ? 'Accede a predicciones con IA de última generación'
                                : 'Comienza con 3 predicciones gratis al mes'}
                        </p>
                    </div>

                    {/* Demo Mode Notice */}
                    {isDemoMode && (
                        <div
                            className="p-5 rounded-xl text-center"
                            style={{
                                background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(245, 158, 11, 0.05))',
                                border: '1px solid rgba(234, 179, 8, 0.3)',
                                marginBottom: '32px'
                            }}
                        >
                            <span className="text-lg mr-2">🧪</span>
                            <span style={{ color: '#fbbf24' }}>Modo Demo - Usa cualquier email/contraseña</span>
                        </div>
                    )}

                    {/* Google Login */}
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 py-5 px-6 rounded-xl font-semibold transition-all"
                        style={{
                            backgroundColor: '#ffffff',
                            color: '#374151',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continuar con Google
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4" style={{ margin: '32px 0' }}>
                        <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(100, 116, 139, 0.3)' }} />
                        <span style={{ color: '#64748b', fontSize: '14px' }}>o con email</span>
                        <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(100, 116, 139, 0.3)' }} />
                    </div>

                    {/* Quick Demo Buttons */}
                    {isDemoMode && mode === 'login' && (
                        <div className="flex gap-4" style={{ marginBottom: '32px' }}>
                            <button
                                type="button"
                                onClick={() => fillDemoCredentials('user')}
                                className="flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                    color: '#60a5fa'
                                }}
                            >
                                <span>👤</span> Usuario Demo
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDemoCredentials('admin')}
                                className="flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(139, 92, 246, 0.05))',
                                    border: '1px solid rgba(168, 85, 247, 0.3)',
                                    color: '#c084fc'
                                }}
                            >
                                <span>⚙️</span> Admin Demo
                            </button>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                        {/* Name Field (Register only) */}
                        {mode === 'register' && (
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                                    Nombre completo
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">👤</span>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 rounded-xl text-white transition-all focus:outline-none"
                                        style={{
                                            backgroundColor: 'rgba(30, 41, 59, 0.8)',
                                            border: '2px solid rgba(100, 116, 139, 0.3)'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = 'rgba(16, 185, 129, 0.6)'}
                                        onBlur={(e) => e.target.style.borderColor = 'rgba(100, 116, 139, 0.3)'}
                                        placeholder="Tu nombre"
                                        required={mode === 'register'}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                                Correo electrónico
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">📧</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value.trim())}
                                    className="w-full pl-12 pr-4 py-5 rounded-xl text-white transition-all focus:outline-none text-center"
                                    style={{
                                        backgroundColor: 'rgba(30, 41, 59, 0.8)',
                                        border: '2px solid rgba(100, 116, 139, 0.3)'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'rgba(16, 185, 129, 0.6)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(100, 116, 139, 0.3)'}
                                    placeholder="tu@email.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                                Contraseña
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔒</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-14 py-5 rounded-xl text-white transition-all focus:outline-none text-center"
                                    style={{
                                        backgroundColor: 'rgba(30, 41, 59, 0.8)',
                                        border: '2px solid rgba(100, 116, 139, 0.3)'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'rgba(16, 185, 129, 0.6)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(100, 116, 139, 0.3)'}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-lg"
                                    style={{ color: '#64748b' }}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div
                                className="p-4 rounded-xl flex items-center gap-3"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
                                    border: '1px solid rgba(239, 68, 68, 0.3)'
                                }}
                            >
                                <span className="text-xl">❌</span>
                                <span style={{ color: '#f87171', fontSize: '14px' }}>{error}</span>
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div
                                className="p-4 rounded-xl flex items-center gap-3"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))',
                                    border: '1px solid rgba(16, 185, 129, 0.3)'
                                }}
                            >
                                <span className="text-xl">✅</span>
                                <span style={{ color: '#34d399', fontSize: '14px' }}>{success}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 px-6 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: mode === 'login'
                                    ? 'linear-gradient(135deg, #10b981, #059669)'
                                    : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                color: '#ffffff',
                                boxShadow: mode === 'login'
                                    ? '0 10px 30px -5px rgba(16, 185, 129, 0.4)'
                                    : '0 10px 30px -5px rgba(139, 92, 246, 0.4)'
                            }}
                            onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Procesando...
                                </span>
                            ) : mode === 'login' ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span>🚀</span> Iniciar Sesión
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <span>✨</span> Crear Mi Cuenta
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Toggle Mode */}
                    <div className="text-center mt-6" style={{ color: '#94a3b8' }}>
                        {mode === 'login' ? (
                            <p>
                                ¿Nuevo en OmniBet?{' '}
                                <button
                                    onClick={() => { setMode('register'); setError(''); }}
                                    className="font-semibold transition-colors"
                                    style={{ color: '#8b5cf6' }}
                                    onMouseOver={(e) => e.currentTarget.style.color = '#a78bfa'}
                                    onMouseOut={(e) => e.currentTarget.style.color = '#8b5cf6'}
                                >
                                    Crea tu cuenta gratis
                                </button>
                            </p>
                        ) : (
                            <p>
                                ¿Ya tienes cuenta?{' '}
                                <button
                                    onClick={() => { setMode('login'); setError(''); }}
                                    className="font-semibold transition-colors"
                                    style={{ color: '#10b981' }}
                                    onMouseOver={(e) => e.currentTarget.style.color = '#34d399'}
                                    onMouseOut={(e) => e.currentTarget.style.color = '#10b981'}
                                >
                                    Inicia sesión
                                </button>
                            </p>
                        )}
                    </div>

                    {/* Benefits Footer */}
                    <div
                        className="mt-8 pt-6"
                        style={{ borderTop: '1px solid rgba(100, 116, 139, 0.2)' }}
                    >
                        <p className="text-center text-sm mb-4" style={{ color: '#64748b' }}>
                            🎁 Tu cuenta gratuita incluye:
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: '🎯', text: '3 predicciones/mes' },
                                { icon: '📊', text: 'Historial completo' },
                                { icon: '📈', text: 'Estadísticas básicas' },
                                { icon: '📢', text: 'Con anuncios' }
                            ].map((benefit, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-2 p-2 rounded-lg"
                                    style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
                                >
                                    <span>{benefit.icon}</span>
                                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>{benefit.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
