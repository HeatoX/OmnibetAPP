'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getUserProfile } from '@/lib/supabase-config';
import { useAuth } from './AuthContext';

const ProfileContext = createContext({});

// Admin emails that have full access (Shared with Auth if needed, but here is for UI logic)
const ADMIN_EMAILS = [
    'pablo@admin.com',
    'admin@omnibet.ai',
    'admin',
    'admin@example.com',
    'pablollu18@gmail.com',
    'kesp230590@gmail.com'
];

export function ProfileProvider({ children }) {
    const { user, sessionResolved } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    useEffect(() => {
        if (!sessionResolved) return;

        if (user) {
            loadProfile(user.id, user);
        } else {
            setProfile(null);
            setLoadingProfile(false);
        }
    }, [user, sessionResolved]);

    async function loadProfile(userId, currentUser = null) {
        try {
            setLoadingProfile(true);
            const profileData = await getUserProfile(userId);

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
                // Failsafe for admins
                setProfile({
                    id: userId,
                    email: userEmail,
                    subscription_tier: 'diamond',
                    is_admin: true,
                    predictions_used_this_month: 0
                });
                setLoadingProfile(false);
            } else {
                // Not an admin and no profile? create it
                await createProfile(userId, activeUser);
            }
        } catch (error) {
            console.error('Profile Load Error:', error);
            // Attempt creation if fetch fails and user exists
            if (user) await createProfile(userId, currentUser || user);
        } finally {
            setLoadingProfile(false);
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
                subscription_tier: isAdmin ? 'diamond' : 'free',
                predictions_used_this_month: 0,
            })
            .select()
            .single();

        if (!error && data) {
            setProfile({
                ...data,
                subscription_tier: isAdmin ? 'diamond' : data.subscription_tier,
                is_admin: isAdmin
            });
        }
    }

    const value = {
        profile,
        loadingProfile,
        refreshProfile: () => user && loadProfile(user.id, user)
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
}

export default ProfileContext;
