'use client';

import { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import { useProfile } from './ProfileContext';
import { canViewPrediction, incrementPredictionsUsed } from '@/lib/supabase-config';

const SubscriptionContext = createContext({});

export function SubscriptionProvider({ children }) {
    const { user } = useAuth();
    const { profile, refreshProfile } = useProfile();

    // Check if user can view a prediction
    function checkPredictionAccess() {
        if (!user || !profile) {
            return { allowed: false, reason: 'login_required' };
        }

        // Admins have unlimited access
        if (profile.is_admin) {
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

        // Refresh local profile state
        refreshProfile();

        return true;
    }

    // Get subscription tier display info
    function getSubscriptionInfo() {
        if (!profile) {
            return { tier: 'guest', label: 'Invitado', color: 'gray', effectiveTier: 'guest' };
        }

        const rawTier = profile.subscription_tier || 'free';
        const isAdmin = profile.is_admin;

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

    const value = {
        checkPredictionAccess,
        usePrediction,
        getSubscriptionInfo
    };

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
}

export default SubscriptionContext;
