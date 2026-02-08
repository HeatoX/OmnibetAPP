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
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // Check session on mount
    useEffect(() => {
        checkSession();

        // FAILSAFE: Force loading to false after 3s to prevent infinite spinner
        const safetyTimer = setTimeout(() => {
            setLoading(false);
        }, 3000);

        return () => clearTimeout(safetyTimer);
    }, []);

    // Listen for auth changes (wrapped in try-catch for resilience)
    useEffect(() => {
        let subscription = null;
        try {
            const result = supabase.auth.onAuthStateChange(
                async (event, session) => {
                    if (session?.user) {
                        setUser(session.user);
                        await loadProfile(session.user.id);
                    } else {
                        setUser(null);
                        setProfile(null);
                    }
                    setLoading(false);
                }
            );
            subscription = result?.data?.subscription;
        } catch (error) {
            console.error('Auth state change error:', error);
            setLoading(false);
        }

        return () => subscription?.unsubscribe?.();
    }, []);

    async function checkSession() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                await loadProfile(session.user.id);
            }
        } catch (error) {
            console.error('Session check error:', error);
        }
        setLoading(false);
    }

    async function loadProfile(userId) {
        try {
            const profileData = await getUserProfile(userId);

            // Safety check for user email (especially in mock mode)
            const userEmail = profileData?.email || user?.email || '';
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
            await createProfile(userId);
        }
    }

    async function createProfile(userId) {
        const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

        const { data, error } = await supabase
            .from('profiles')
            .insert({
                id: userId,
                email: user?.email,
                subscription_tier: isAdmin ? 'diamond' : 'free', // Admins get diamond
                predictions_used_this_month: 0,
                // is_admin column removed/handled by logic or need to ensure schema has it. 
                // Schema has subscription_tier, let's treat diamond as admin for now or rely on email check.
            })
            .select()
            .single();

        if (!error) {
            setProfile(data);
        }
    }

    async function signUp(email, password, name) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name },
                emailRedirectTo: typeof window !== 'undefined' ? window.location.origin + '/auth/callback' : undefined,
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
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
            options: {
                data: { name }
            }
        });

        if (error) throw error;

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
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: typeof window !== 'undefined' ? window.location.origin + '/app' : undefined,
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

    // Get subscription tier display info
    function getSubscriptionInfo() {
        if (!profile) {
            return { tier: 'guest', label: 'Invitado', color: 'gray' };
        }

        const tiers = {
            free: { label: 'Free', color: 'gray', limit: 2 },
            gold: { label: 'Gold', color: 'yellow', limit: Infinity },
            diamond: { label: 'Diamond', color: 'cyan', limit: Infinity },
        };

        const tier = profile.subscription_tier || 'free';
        const info = tiers[tier] || tiers.free;

        return {
            tier,
            ...info,
            used: profile.predictions_used_this_month || 0,
            remaining: Math.max(0, info.limit - (profile.predictions_used_this_month || 0)),
        };
    }

    const value = {
        user,
        profile,
        loading,
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
