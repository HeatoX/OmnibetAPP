// ========================================
// Supabase Configuration with Demo Mode
// ========================================

import { createClient } from '@supabase/supabase-js';

// These will be environment variables in production
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project');

// Create Supabase client only if configured
export const supabase = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createMockSupabaseClient();

// Demo mode flag
export const isDemoMode = !isSupabaseConfigured;

// ========================================
// Mock Supabase Client for Demo Mode
// ========================================

function createMockSupabaseClient() {
    // In-memory storage for demo
    let demoUsers = new Map();
    const demoPredictions = [];
    let currentUser = null;

    // Load from localStorage if available
    if (typeof window !== 'undefined') {
        try {
            const savedUsers = localStorage.getItem('omnibet_demo_users');
            if (savedUsers) {
                JSON.parse(savedUsers).forEach(u => demoUsers.set(u.id, u));
            }

            const savedSession = localStorage.getItem('omnibet_demo_session');
            if (savedSession) {
                currentUser = JSON.parse(savedSession);
            }

            const savedPredictions = localStorage.getItem('omnibet_demo_predictions');
            if (savedPredictions) {
                const parsed = JSON.parse(savedPredictions);
                if (Array.isArray(parsed)) {
                    // Populate demoPredictions array safely
                    parsed.forEach(p => demoPredictions.push(p));
                }
            }
        } catch (e) {
            console.error('Error loading demo data', e);
        }
    }

    const saveState = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('omnibet_demo_users', JSON.stringify(Array.from(demoUsers.values())));
            if (currentUser) {
                localStorage.setItem('omnibet_demo_session', JSON.stringify(currentUser));
            } else {
                localStorage.removeItem('omnibet_demo_session');
            }
            // Save predictions
            localStorage.setItem('omnibet_demo_predictions', JSON.stringify(demoPredictions));
        }
    };

    const authCallbacks = new Set();

    const notifyAuthChange = (event, session) => {
        console.log(`🧪 [DemoAuth] Notificando: ${event}`);
        authCallbacks.forEach(callback => callback(event, session));
    };

    return {
        auth: {
            getSession: async () => ({ data: { session: currentUser ? { user: currentUser } : null } }),
            onAuthStateChange: (callback) => {
                authCallbacks.add(callback);
                // Initial call
                setTimeout(() => callback('INITIAL_SESSION', currentUser ? { user: currentUser } : null), 0);
                return { data: { subscription: { unsubscribe: () => authCallbacks.delete(callback) } } };
            },
            signUp: async ({ email, password, options }) => {
                const user = {
                    id: 'demo-' + Date.now(),
                    email,
                    user_metadata: options?.data || {},
                };
                demoUsers.set(user.id, {
                    id: user.id,
                    email,
                    name: options?.data?.name || email.split('@')[0],
                    subscription_tier: 'free',
                    predictions_used_this_month: 0,
                });
                currentUser = user;
                saveState();
                notifyAuthChange('SIGNED_IN', { user });
                return { data: { user }, error: null };
            },
            signInWithPassword: async ({ email, password }) => {
                // For demo, accept any password
                const existingUser = Array.from(demoUsers.values()).find(u => u.email === email);
                if (existingUser) {
                    currentUser = { id: existingUser.id, email, user_metadata: { name: existingUser.name } };
                    saveState();
                    notifyAuthChange('SIGNED_IN', { user: currentUser });
                    return { data: { user: currentUser }, error: null };
                }
                // Auto-create user in demo mode
                const user = {
                    id: 'demo-' + Date.now(),
                    email,
                };
                demoUsers.set(user.id, {
                    id: user.id,
                    email,
                    name: email.split('@')[0],
                    subscription_tier: 'free',
                    predictions_used_this_month: 0,
                    // Make admin@omnibet.ai an admin
                    is_admin: email === 'admin@omnibet.ai' || email === 'pablo@admin.com',
                });
                currentUser = user;
                saveState();
                notifyAuthChange('SIGNED_IN', { user });
                return { data: { user }, error: null };
            },
            signInWithOAuth: async ({ provider }) => {
                // Mock OAuth - create a permanent demo user
                const user = {
                    id: 'demo-google-' + Date.now(),
                    email: 'google-user@demo.com',
                    user_metadata: { name: 'Google User' },
                };
                demoUsers.set(user.id, {
                    id: user.id,
                    email: user.email,
                    name: 'Google User',
                    subscription_tier: 'free',
                    predictions_used_this_month: 0,
                });
                currentUser = user;
                saveState();
                return { data: { user }, error: null };
            },
            signOut: async () => {
                currentUser = null;
                saveState();
                return { error: null };
            },
        },
        from: (table) => ({
            select: (columns) => ({
                eq: (column, value) => ({
                    single: async () => {
                        if (table === 'users' || table === 'profiles') {
                            const user = demoUsers.get(value);
                            return { data: user || null, error: user ? null : { message: 'Data not found' } };
                        }
                        return { data: null, error: null };
                    },
                    order: () => ({
                        limit: async () => ({ data: [], error: null }),
                    }),
                }),
                // Fix: Allow selecting from prediction_history in demo mode
                ...(table === 'prediction_history' || table === 'predictions' ? {
                    select: () => ({
                        in: (col, vals) => {
                            const result = { data: demoPredictions, error: null };
                            const thenable = (res) => ({
                                then: (resolve) => resolve(res),
                                limit: async () => res,
                                order: () => thenable(res),
                                gte: () => thenable(res)
                            });

                            return {
                                gte: () => thenable(result),
                                order: () => thenable(result),
                                eq: (col, val) => ({
                                    maybeSingle: async () => {
                                        const found = demoPredictions.find(p => p[col] === val);
                                        return { data: found || null, error: null };
                                    }
                                })
                            };
                        },
                        insert: (data) => ({
                            select: () => ({
                                single: async () => {
                                    const newRec = { ...data, id: Date.now(), created_at: new Date().toISOString() };
                                    demoPredictions.push(newRec);
                                    saveState();
                                    return { data: newRec, error: null };
                                },
                            }),
                        }),
                        upsert: (data) => ({
                            select: () => {
                                const idx = demoPredictions.findIndex(p => p.match_id === data.match_id);
                                if (idx >= 0) {
                                    demoPredictions[idx] = { ...demoPredictions[idx], ...data };
                                } else {
                                    demoPredictions.push({ ...data, id: Date.now() });
                                }
                                saveState();
                                return Promise.resolve({ data: data, error: null });
                            }
                        })
                    })
                } : {}),
                not: () => ({
                    select: async () => ({ data: demoPredictions, error: null }),
                }),
                order: (column, { ascending }) => ({
                    limit: async (n) => ({ data: demoPredictions.slice(0, n), error: null }),
                }),
            }),
            insert: (data) => ({
                select: () => ({
                    single: async () => {
                        if (table === 'users' || table === 'profiles') {
                            demoUsers.set(data.id, data);
                            saveState();
                            return { data, error: null };
                        }
                        if (table === 'predictions') {
                            demoPredictions.push({ ...data, id: Date.now() });
                            return { data, error: null };
                        }
                        return { data, error: null };
                    },
                }),
            }),
            update: (data) => ({
                eq: (column, value) => ({
                    select: () => ({
                        single: async () => {
                            if ((table === 'users' || table === 'profiles') && demoUsers.has(value)) {
                                const user = demoUsers.get(value);
                                Object.assign(user, data);
                                demoUsers.set(value, user);
                                saveState();
                                return { data: user, error: null };
                            }
                            return { data: null, error: null };
                        },
                    }),
                }),
            }),
        }),
    };
}

// ========================================
// Database Helper Functions
// ========================================

/**
 * Get user profile with subscription info
 */
export async function getUserProfile(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;

    // Map DB columns to App state
    return {
        ...data,
        predictions_used_this_month: data.predictions_count || 0
    };
}

/**
 * Update user subscription
 */
export async function updateSubscription(userId, tier, endDate) {
    const { data, error } = await supabase
        .from('profiles')
        .update({
            subscription_tier: tier,
            // Schema doesn't currently support subscription_end, ignoring for now or using metadata
            // subscription_status: 'active'
        })
        .eq('id', userId);

    if (error) throw error;
    return data;
}

/**
 * Increment predictions used
 */
export async function incrementPredictionsUsed(userId) {
    const { data: user } = await supabase
        .from('profiles')
        .select('predictions_count, last_prediction_date')
        .eq('id', userId)
        .single();

    // Reset counter if new month
    const lastDate = user?.last_prediction_date ? new Date(user.last_prediction_date) : new Date(0);
    const now = new Date();

    let newCount = (user?.predictions_count || 0);

    if (lastDate.getMonth() !== now.getMonth() || lastDate.getFullYear() !== now.getFullYear()) {
        newCount = 0;
    }

    newCount++;

    const { error } = await supabase
        .from('profiles')
        .update({
            predictions_count: newCount,
            last_prediction_date: now.toISOString()
        })
        .eq('id', userId);

    if (error) console.error('Error updating usage:', error);

    return newCount;
}

/**
 * Check if user can view more predictions
 */
export function canViewPrediction(user) {
    if (!user) return { allowed: false, reason: 'login_required' };

    const tier = user.subscription_tier || 'free';
    const used = user.predictions_used_this_month || 0;
    const now = new Date();

    // 1. Check Trial Access (if Free)
    if (tier === 'free') {
        const createdAt = user.created_at ? new Date(user.created_at) : new Date();
        const trialExpiry = new Date(createdAt.getTime() + (7 * 24 * 60 * 60 * 1000));

        if (now < trialExpiry) {
            // TRIAL ACTIVE: Full access like Gold
            return { allowed: true, reason: 'trial_active', tier: 'gold', trial: true };
        } else {
            // TRIAL EXPIRED: Total lockout (per USER request: "se bloquea todo")
            return { allowed: false, reason: 'trial_expired', tier: 'free' };
        }
    }

    // 2. Check Paid Subscription Expiry
    if (user.subscription_end_date) {
        const endDate = new Date(user.subscription_end_date);
        if (now > endDate) {
            return { allowed: false, reason: 'subscription_expired', tier };
        }
    }

    // 3. Fallback to default limits (if trial or sub is active)
    const limits = {
        free: 0,        // Should already be handled by trial logic above
        gold: Infinity,
        diamond: Infinity,
    };

    const limit = limits[tier] || 0;

    return { allowed: true, reason: 'ok', tier, used, limit };
}

/**
 * Save prediction to history
 */
export async function savePrediction(prediction) {
    const { data, error } = await supabase
        .from('predictions')
        .insert({
            match_id: prediction.matchId,
            sport: prediction.sport,
            home_team: prediction.homeTeam,
            away_team: prediction.awayTeam,
            predicted_winner: prediction.predictedWinner,
            predicted_market: prediction.predictedMarket,
            confidence: prediction.confidence,
            odds: prediction.odds,
            match_date: prediction.matchDate,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Get prediction history with results
 */
export async function getPredictionHistory(limit = 100) {
    // Return demo data if in demo mode
    if (isDemoMode) {
        return generateDemoPredictions();
    }

    const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
}

/**
 * Generate demo predictions for history page
 */
function generateDemoPredictions() {
    // RETURN EMPTY by default.
    // The user wants REAL data.
    // We will only populate this from localStorage (which is loaded into demoPredictions array above).
    // So this initial "fake" list should be empty.
    return [];
}

/**
 * Update prediction result
 */
export async function updatePredictionResult(predictionId, actualResult, wasCorrect) {
    const { data, error } = await supabase
        .from('predictions')
        .update({
            actual_result: actualResult,
            was_correct: wasCorrect,
        })
        .eq('id', predictionId);

    if (error) throw error;
    return data;
}

/**
 * Get accuracy statistics
 */
export async function getAccuracyStats() {
    // Return demo stats if in demo mode
    if (isDemoMode) {
        return { total: 156, correct: 128, accuracy: 82, roi: 18.5 };
    }

    const { data: predictions } = await supabase
        .from('predictions')
        .select('*')
        .not('was_correct', 'is', null);

    if (!predictions || predictions.length === 0) {
        return { total: 0, correct: 0, accuracy: 0, roi: 0 };
    }

    const total = predictions.length;
    const correct = predictions.filter(p => p.was_correct).length;
    const accuracy = Math.round((correct / total) * 100);

    // Calculate ROI (assuming flat $100 bets)
    let totalStaked = 0;
    let totalReturns = 0;

    predictions.forEach(p => {
        totalStaked += 100;
        if (p.was_correct && p.odds) {
            totalReturns += 100 * parseFloat(p.odds);
        }
    });

    const roi = totalStaked > 0 ? Math.round(((totalReturns - totalStaked) / totalStaked) * 100) : 0;

    return { total, correct, accuracy, roi };
}

export default supabase;
