'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isDemoMode, getUserProfile, canViewPrediction, incrementPredictionsUsed } from '@/lib/supabase-config';

const AuthContext = createContext({});

// Admin emails that have full access
const ADMIN_EMAILS = [
    'pablo@admin.com',
    'admin@omnibet.ai',
    'admin',
    'admin@example.com',
    'pablollu18@gmail.com',
    'kesp230590@gmail.com'
];

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionResolved, setSessionResolved] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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
                    await loadProfile(session.user.id, session.user);
                } else {
                    console.log('🔐 [Auth] No se encontró sesión activa.');
                    setUser(null);
                    setProfile(null);
                }
            } catch (err) {
                // V50.13: SILENCE ABORT ERRORS - These are internal React/Browser noise
                const isAbort = err.name === 'AbortError' || err.message?.includes('aborted');

                if (!isAbort && !ignore) {
                    console.error('🔥 [Auth] Error real en la sesión:', err);
                    setUser(null);
                    setProfile(null);
                } else {
                    console.log('🛡️ [Auth] AbortError detectado y silenciado.');
                    // Don't modify user state if it was aborted
                    return;
                }
            } finally {
                // V50.13: ONLY resolve session if it wasn't aborted
                // This forces the app to keep waiting for a stable mount/fetch
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
                    await loadProfile(session.user.id, session.user);
                } else if (event === 'SIGNED_OUT' || !session) {
                    setUser(null);
                    setProfile(null);
                }
                setLoading(false);
                setSessionResolved(true);
            }
        );

        return () => { active = false; data?.subscription?.unsubscribe(); };
    }, []);

    // Standalone checkSession (for manual refreshes)
    async function checkSession() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                await loadProfile(session.user.id, session.user);
            } else {
                setUser(null);
                setProfile(null);
            }
        } catch (e) {
            console.error('Manual checkSession error:', e);
        } finally {
            setLoading(false);
            setSessionResolved(true);
        }
    }

    async function loadProfile(userId, currentUser = null) {
        try {
            const profileData = await getUserProfile(userId);

            // Use the passed user object or fallback to state
            const activeUser = currentUser || user;
            const userEmail = profileData?.email || activeUser?.email || '';
            const isAdmin = ADMIN_EMAILS.includes(userEmail);

            if (profileData) {
                setProfile({
                    ...profileData,
                    is_admin: isAdmin,
                    subscription_tier: isAdmin ? 'diamond' : profileData.subscription_tier
                });
            } else if (isAdmin) {
                // Failsafe for admins in demo mode if profile fetch fails
                setProfile({
                    id: userId,
                    email: userEmail,
                    subscription_tier: 'diamond',
                    is_admin: true,
                    predictions_used_this_month: 0
                });
            }
        } catch (error) {
            // User might not have a profile yet, create one
            console.log('Creating new profile for user');
            await createProfile(userId, currentUser);
        }
    }

    async function createProfile(userId, currentUser = null) {
        const activeUser = currentUser || user;
        const isAdmin = activeUser?.email && ADMIN_EMAILS.includes(activeUser.email);

        const { data, error } = await supabase
            .from('profiles')
            .insert({
                id: userId,
                email: activeUser?.email,
                subscription_tier: isAdmin ? 'diamond' : 'free', // Admins get diamond
                predictions_used_this_month: 0,
            })
            .select()
            .single();

        if (!error) {
            // Ensure the profile state also gets the diamond override immediately
            setProfile({
                ...data,
                subscription_tier: isAdmin ? 'diamond' : data.subscription_tier,
                is_admin: isAdmin
            });
        }
    }

    async function signUp(email, password, name) {
        // Force production URL if available, otherwise fallback to current origin
        const siteUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://omnibet-app.vercel.app');

        console.log('Using redirect URL:', siteUrl + '/auth/callback');

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
            const isAdmin = ADMIN_EMAILS.includes(email);
            setProfile({
                id: data.user.id,
                email,
                name,
                subscription_tier: isAdmin ? 'diamond' : 'free',
                predictions_used_this_month: 0,
                is_admin: isAdmin,
            });

            // Redirect to app
            if (typeof window !== 'undefined') {
                window.location.href = '/app';
            }
        }

        return data;
    }

    async function signIn(email, password) {
        // V50.3: Set session hint before sign in
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

        // In demo mode, set user immediately
        if (isDemoMode && data.user) {
            setUser(data.user);
            const isAdmin = ADMIN_EMAILS.includes(email);
            setProfile({
                id: data.user.id,
                email,
                name: email.split('@')[0],
                subscription_tier: isAdmin ? 'diamond' : 'free',
                predictions_used_this_month: 0,
                is_admin: isAdmin,
            });

            // Redirect to app
            if (typeof window !== 'undefined') {
                window.location.href = '/app';
            }
        }

        return data;
    }

    async function signInWithGoogle() {
        // V50.3: Set session hint
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
        setProfile(null);
    }

    // Check if user can view a prediction
    function checkPredictionAccess() {
        if (!user || !profile) {
            return { allowed: false, reason: 'login_required' };
        }

        // Admins have unlimited access
        if (profile.is_admin || ADMIN_EMAILS.includes(user.email)) {
            return { allowed: true, reason: 'admin', tier: 'diamond' };
        }

        return canViewPrediction(profile);
    }

    // Use a prediction (increment counter)
    async function usePrediction() {
        if (!user || !profile) return false;

        // Admins don't use prediction slots
        if (profile.is_admin) return true;

        const access = checkPredictionAccess();
        if (!access.allowed) return false;

        const newCount = await incrementPredictionsUsed(user.id);
        setProfile(prev => ({
            ...prev,
            predictions_used_this_month: newCount,
        }));

        return true;
    }

    const [showTrialModal, setShowTrialModal] = useState(false);

    // Get subscription tier display info
    function getSubscriptionInfo() {
        if (!profile) {
            return { tier: 'guest', label: 'Invitado', color: 'gray', effectiveTier: 'guest' };
        }

        const rawTier = profile.subscription_tier || 'free';
        const userEmail = profile.email || user?.email || '';
        const isAdmin = profile.is_admin || ADMIN_EMAILS.includes(userEmail);

        // Calculate trial info
        const createdAt = profile.created_at ? new Date(profile.created_at) : new Date();
        const trialExpiry = new Date(createdAt.getTime() + (7 * 24 * 60 * 60 * 1000));
        const now = new Date();
        const trialTimeLeft = trialExpiry.getTime() - now.getTime();
        const trialDaysLeft = Math.ceil(trialTimeLeft / (24 * 60 * 60 * 1000));
        const isTrialActive = rawTier === 'free' && trialTimeLeft > 0;

        // Calculate subscription expiry
        const subExpiryDate = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null;
        const subTimeLeft = subExpiryDate ? subExpiryDate.getTime() - now.getTime() : 0;
        const subDaysLeft = Math.ceil(subTimeLeft / (24 * 60 * 60 * 1000));
        const isSubActive = rawTier !== 'free' && (isAdmin || subTimeLeft > 0);

        // Deterministic effective tier for UI
        let effectiveTier = rawTier;
        if (isAdmin) effectiveTier = 'diamond';
        else if (isTrialActive) effectiveTier = 'gold';

        const tiers = {
            free: {
                label: isTrialActive ? 'Trial Gold' : 'Free',
                color: isTrialActive ? 'yellow' : 'gray',
                limit: isTrialActive ? Infinity : 2,
                isTrial: isTrialActive,
                daysLeft: isTrialActive ? trialDaysLeft : 0,
                isExpired: !isTrialActive && !isAdmin
            },
            gold: { label: 'Gold', color: 'yellow', limit: Infinity, daysLeft: subDaysLeft, isExpired: !isAdmin && subTimeLeft <= 0 },
            diamond: { label: 'Diamond', color: 'cyan', limit: Infinity, daysLeft: subDaysLeft, isExpired: !isAdmin && subTimeLeft <= 0 },
        };

        const info = tiers[effectiveTier] || tiers.free;

        return {
            tier: rawTier,
            effectiveTier,
            ...info,
            used: profile.predictions_used_this_month || 0,
            remaining: info.limit === Infinity ? Infinity : Math.max(0, info.limit - (profile.predictions_used_this_month || 0)),
            isTrialActive,
            isSubActive,
            trialTimeLeft,
            subTimeLeft,
            isAdmin
        };
    }

    // Effect to handle trial modal auto-show
    useEffect(() => {
        if (profile && profile.subscription_tier === 'free') {
            const hasSeenModal = localStorage.getItem(`hasSeenTrialModal_${profile.id}`);
            const info = getSubscriptionInfo();
            if (!hasSeenModal && info.isTrialActive) {
                setShowTrialModal(true);
            }
        }
    }, [profile]);

    const markModalAsSeen = () => {
        if (profile) {
            localStorage.setItem(`hasSeenTrialModal_${profile.id}`, 'true');
            setShowTrialModal(false);
        }
    };

    const value = {
        user,
        profile,
        loading,
        sessionResolved,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        checkPredictionAccess,
        usePrediction,
        getSubscriptionInfo,
        showLoginModal,
        setShowLoginModal,
        showUpgradeModal,
        setShowUpgradeModal,
        showTrialModal,
        setShowTrialModal: markModalAsSeen,
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
