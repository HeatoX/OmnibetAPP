'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isDemoMode } from '@/lib/supabase-config';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionResolved, setSessionResolved] = useState(false);

    // V50.12: Idempotent initialization (Strict Mode Proof)
    useEffect(() => {
        let ignore = false;

        const initSession = async () => {
            try {
                setLoading(true);
                console.log('🛡️ [Idempotent Guard] Iniciando checkSession seguro...');

                const { data: { session }, error } = await supabase.auth.getSession();

                if (ignore) {
                    console.log('✖️ [Idempotent Guard] Se ignoró un efecto de limpieza.');
                    return;
                }

                if (error) {
                    if (error.name !== 'AbortError' && !error.message?.includes('aborted')) {
                        throw error;
                    }
                    return;
                }

                if (session?.user) {
                    console.log('🔐 [Auth] Sesión activa encontrada:', session.user.email);
                    setUser(session.user);
                } else {
                    console.log('🔐 [Auth] No se encontró sesión activa.');
                    setUser(null);
                }
            } catch (err) {
                // V50.13: SILENCE ABORT ERRORS
                const isAbort = err.name === 'AbortError' || err.message?.includes('aborted');

                if (!isAbort && !ignore) {
                    console.error('🔥 [Auth] Error real en la sesión:', err);
                    setUser(null);
                } else {
                    console.log('🛡️ [Auth] AbortError detectado y silenciado.');
                    return;
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                    setSessionResolved(true);
                    console.log('🛡️ [Idempotent Guard] Verificación inicial completada.');
                }
            }
        };

        initSession();

        return () => {
            console.log('🧹 [Idempotent Guard] Efecto limpiado. Activando ignore.');
            ignore = true;
        };
    }, []);

    // Listen for auth changes
    useEffect(() => {
        let active = true;
        const { data } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!active) return;

                console.log(`🔐 [Auth] Evento: ${event}`, session?.user ? 'Usuario detectado' : 'Sin usuario');
                if (session?.user) {
                    setUser(session.user);
                } else if (event === 'SIGNED_OUT' || !session) {
                    setUser(null);
                }
                setLoading(false);
                setSessionResolved(true);
            }
        );

        return () => { active = false; data?.subscription?.unsubscribe(); };
    }, []);

    async function signUp(email, password, name) {
        const siteUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://omnibet-app.vercel.app');
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name },
                emailRedirectTo: siteUrl + '/auth/callback',
            }
        });

        if (error) throw error;

        // In demo mode, immediately log in
        if (isDemoMode && data.user) {
            setUser(data.user);
            if (typeof window !== 'undefined') {
                window.location.href = '/app';
            }
        }

        return data;
    }

    async function signIn(email, password) {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('omnibet_session_hint', 'true');
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('omnibet_session_hint');
            }
            throw error;
        }

        if (isDemoMode && data.user) {
            setUser(data.user);
            if (typeof window !== 'undefined') {
                window.location.href = '/app';
            }
        }

        return data;
    }

    async function signInWithGoogle() {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('omnibet_session_hint', 'true');
        }

        const siteUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: siteUrl + '/app',
            }
        });

        if (error) throw error;
        return data;
    }

    async function signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setUser(null);
    }

    const value = {
        user,
        loading,
        sessionResolved,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        isDemoMode,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
