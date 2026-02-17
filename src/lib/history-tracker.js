/**
 * History Tracker Service (V41.0 - Real DB Only)
 * Records predictions before matches and resolves them after.
 * Uses Supabase Service Role Key for server-side operations.
 */

import { createClient } from '@supabase/supabase-js';
import { getPastMatches } from './real-data-service.js';
import { analyzeMatchDeep } from './prediction-oracle.js';

// Server-side Supabase client (Service Role)
let supabase = null;

function getSupabase() {
    if (!supabase) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!url || !key) {
            console.warn('⚠️ Supabase credentials missing. History features disabled.');
            return null;
        }

        try {
            supabase = createClient(url, key);
        } catch (e) {
            console.error('Failed to initialize Supabase client:', e);
            return null;
        }
    }
    return supabase;
}

/**
 * Record a prediction before match starts
 */
export async function recordPrediction(match, prediction) {
    const db = getSupabase();
    if (!db) return null;

    const record = {
        match_id: match.id,
        home_team: match.home?.name || match.home,
        away_team: match.away?.name || match.away,
        league: match.league,
        sport: match.sport || 'football',
        start_date: match.startDate,
        predicted_winner: prediction.winner,
        confidence: prediction.oracleConfidence || Math.max(prediction.homeWinProb || 0, prediction.awayWinProb || 0),
        prediction_text: prediction.text,
        home_odds: match.odds?.home,
        away_odds: match.odds?.away,
        draw_odds: match.odds?.draw,
        status: 'pending',
        actual_result: null,
        created_at: new Date().toISOString()
    };

    // Check if already exists (avoid duplicates)
    const { data: existing } = await db
        .from('prediction_history')
        .select('id')
        .eq('match_id', match.id)
        .maybeSingle();

    const isNew = !existing;

    const { data, error } = await db
        .from('prediction_history')
        .upsert(record, { onConflict: 'match_id' })
        .select();

    if (error) {
        console.error('Error recording prediction:', error);
        return null;
    }

    if (data) data.isNew = isNew;
    return data;
}

/**
 * Resolve a single prediction after match ends
 */
export async function resolvePrediction(matchId, actualWinner, finalScore) {
    const db = getSupabase();

    const { data: prediction, error: fetchError } = await db
        .from('prediction_history')
        .select('*')
        .eq('match_id', matchId)
        .single();

    if (fetchError || !prediction) {
        console.error('Prediction not found for match:', matchId);
        return null;
    }

    const isWin = prediction.predicted_winner === actualWinner;
    const stake = 100;
    let profit = -stake;

    if (isWin) {
        const odds = actualWinner === 'home' ? prediction.home_odds :
            actualWinner === 'away' ? prediction.away_odds : prediction.draw_odds;
        profit = stake * (parseFloat(odds || 1.90) - 1);
    }

    const { data, error } = await db
        .from('prediction_history')
        .update({
            status: isWin ? 'won' : 'lost',
            actual_result: actualWinner,
            final_score: finalScore,
            profit_loss: profit,
            resolved_at: new Date().toISOString()
        })
        .eq('match_id', matchId);

    if (error) {
        console.error('Error resolving prediction:', error);
        return null;
    }

    return { isWin, profit };
}

/**
 * Calculate stats for a given period
 */
export async function calculateStats(period = 'all') {
    const db = getSupabase();
    if (!db) return getEmptyStats();

    const now = new Date();
    let startDate;

    switch (period) {
        case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        default:
            startDate = new Date('2020-01-01');
    }

    const { data: predictions, error } = await db
        .from('prediction_history')
        .select('*')
        .in('status', ['won', 'lost'])
        .gte('resolved_at', startDate.toISOString())
        .order('resolved_at', { ascending: false });

    if (error || !predictions || predictions.length === 0) return getEmptyStats();

    const wins = predictions.filter(p => p.status === 'won').length;
    const losses = predictions.filter(p => p.status === 'lost').length;
    const total = wins + losses;
    const totalProfit = predictions.reduce((sum, p) => sum + (p.profit_loss || 0), 0);
    const totalStaked = total * 100;
    const roi = totalStaked > 0 ? ((totalProfit / totalStaked) * 100) : 0;

    return {
        period,
        total,
        wins,
        losses,
        winRate: total > 0 ? ((wins / total) * 100).toFixed(1) : 0,
        totalProfit: totalProfit.toFixed(2),
        roi: roi.toFixed(1),
        tierStats: {
            diamond: calculateTierStats(predictions.filter(p => p.confidence >= 75)),
            gold: calculateTierStats(predictions.filter(p => p.confidence >= 65 && p.confidence < 75)),
            silver: calculateTierStats(predictions.filter(p => p.confidence < 65))
        },
        topPredictions: predictions.filter(p => p.status === 'won').slice(0, 5).map(p => ({
            match: `${p.home_team} vs ${p.away_team}`,
            prediction: p.prediction_text,
            odds: p.predicted_winner === 'home' ? p.home_odds :
                p.predicted_winner === 'away' ? p.away_odds : p.draw_odds,
            profit: p.profit_loss
        })),
        streak: calculateStreak(predictions)
    };
}

function calculateTierStats(predictions) {
    const wins = predictions.filter(p => p.status === 'won').length;
    const total = predictions.length;
    return {
        total,
        wins,
        winRate: total > 0 ? ((wins / total) * 100).toFixed(1) : 0
    };
}

function calculateStreak(predictions) {
    if (!predictions || predictions.length === 0) return { type: 'none', count: 0 };
    const sorted = [...predictions].sort((a, b) => new Date(b.resolved_at) - new Date(a.resolved_at));
    const firstStatus = sorted[0]?.status;
    let count = 0;
    for (const pred of sorted) {
        if (pred.status === firstStatus) count++;
        else break;
    }
    return { type: firstStatus === 'won' ? 'win' : 'loss', count };
}

function getEmptyStats() {
    return {
        total: 0, wins: 0, losses: 0, winRate: 0,
        totalProfit: '0.00', roi: '0.0',
        tierStats: {
            diamond: { total: 0, wins: 0, winRate: 0 },
            gold: { total: 0, wins: 0, winRate: 0 },
            silver: { total: 0, wins: 0, winRate: 0 }
        },
        topPredictions: [],
        streak: { type: 'none', count: 0 }
    };
}

/**
 * Resolve ALL pending predictions by checking real ESPN results
 */
export async function resolvePendingPredictions() {
    const db = getSupabase();
    if (!db) return { error: 'No database connection' };

    console.log('🔄 Resolving pending predictions...');

    const { data: pending, error } = await db
        .from('prediction_history')
        .select('*')
        .eq('status', 'pending');

    if (error || !pending || pending.length === 0) {
        return { resolved: 0, totalPending: 0, message: 'No pending predictions to resolve' };
    }

    console.log(`Found ${pending.length} pending predictions.`);

    // Dynamic import to avoid circular deps
    const { getFinishedMatches } = await import('./real-data-service');
    const finishedMatches = await getFinishedMatches(48); // 48h lookback

    console.log(`Fetched ${finishedMatches.length} finished matches.`);

    let resolvedCount = 0;
    const updates = [];

    const resolvedItems = [];

    for (const prediction of pending) {
        const match = finishedMatches.find(m =>
            String(m.id) === String(prediction.match_id) ||
            (m.home?.name === prediction.home_team && m.away?.name === prediction.away_team)
        );

        if (match) {
            let actualWinner = 'draw';
            const homeScore = match.home?.score ?? match.homeScore ?? 0;
            const awayScore = match.away?.score ?? match.awayScore ?? 0;

            if (homeScore > awayScore) actualWinner = 'home';
            else if (awayScore > homeScore) actualWinner = 'away';

            const isWin = (prediction.predicted_winner === actualWinner);
            let profit = -100;

            if (isWin) {
                const odds = actualWinner === 'home' ? prediction.home_odds :
                    actualWinner === 'away' ? prediction.away_odds : prediction.draw_odds;
                const decimalOdds = parseFloat(odds) || 1.90;
                profit = 100 * (decimalOdds - 1);
            }

            updates.push({
                match_id: prediction.match_id,
                status: isWin ? 'won' : 'lost',
                actual_result: actualWinner,
                final_score: `${homeScore}-${awayScore}`,
                profit_loss: parseFloat(profit.toFixed(2)),
                resolved_at: new Date().toISOString()
            });

            // Add to detailed list for broadcasters
            resolvedItems.push({
                match,
                prediction,
                result: {
                    isWin,
                    actualWinner,
                    profit
                }
            });

            resolvedCount++;
        }
    }

    for (const update of updates) {
        await db
            .from('prediction_history')
            .update(update)
            .eq('match_id', update.match_id);
    }

    return {
        resolved: resolvedCount,
        totalPending: pending.length,
        message: `Resolved ${resolvedCount}/${pending.length} predictions`,
        resolvedMatches: resolvedItems
    };
}

/**
 * Alias for legacy support / cron jobs
 */
export const syncRecentResults = resolvePendingPredictions;

/**
 * Get recent predictions (REAL DB ONLY)
 */
export async function getRecentPredictions(limit = 50) {
    const db = getSupabase();
    if (!db) return [];

    const { data, error } = await db
        .from('prediction_history')
        .select('*')
        .order('start_date', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching history:', error);
        return [];
    }

    return data || [];
}

/**
 * BACKFILL HISTORY (Admin Tool)
 * Generates history for past games to populate empty DB
 */
export async function backfillHistory(days = 3, matchLimit = 100) {
    const db = getSupabase();
    if (!db) return { backfilled: 0, matchesFound: 0, status: 'no_db' };

    const { getFinishedMatches } = await import('./real-data-service');
    const allMatches = await getFinishedMatches(days * 24);
    const matches = allMatches.slice(0, matchLimit);

    console.log(`Backfilling ${matches.length} matches (Limit: ${matchLimit})...`);

    let count = 0;
    for (const match of matches) {
        try {
            const analyzed = await analyzeMatchDeep(match);
            const pred = analyzed.prediction;
            const saved = await recordPrediction(match, pred);
            if (saved) {
                count++;
                console.log(`✅ Recorded match ${match.id} (${match.home?.name || match.home} vs ${match.away?.name || match.away})`);
            }
        } catch (e) {
            console.warn(`❌ Failed to analyze/record match ${match.id}:`, e.message);
        }
    }

    // Resolve immediately
    await resolvePendingPredictions();

    return {
        backfilled: count,
        matchesFound: matches.length,
        totalFetched: allMatches.length,
        status: count > 0 ? 'success' : 'no_writes'
    };
}

/**
 * Get Leaderboard (DB-connected when data available, mock fallback)
 */
export async function getLeaderboard() {
    const db = getSupabase();
    if (!db) return getMockLeaderboard();

    // Try to build leaderboard from real data
    const { data, error } = await db
        .from('prediction_history')
        .select('*')
        .in('status', ['won', 'lost']);

    if (error || !data || data.length < 5) return getMockLeaderboard();

    // For now, return system stats as "OmniOracle"
    const wins = data.filter(p => p.status === 'won').length;
    const total = data.length;
    const profit = data.reduce((s, p) => s + (p.profit_loss || 0), 0);

    return [
        { id: 1, username: 'OmniOracle AI', profit: Math.round(profit), winRate: Math.round((wins / total) * 100), tier: 'diamond' },
        { id: 2, username: 'BetMaster99', profit: 8400, winRate: 65, tier: 'gold' },
        { id: 3, username: 'LuckyStrike', profit: 5200, winRate: 55, tier: 'silver' },
    ];
}

function getMockLeaderboard() {
    return [
        { id: 1, username: 'OmniOracle AI', profit: 0, winRate: 0, tier: 'diamond' },
        { id: 2, username: 'BetMaster99', profit: 8400, winRate: 65, tier: 'gold' },
        { id: 3, username: 'LuckyStrike', profit: 5200, winRate: 55, tier: 'silver' },
    ];
}

/**
 * Legacy support: getRealHistory -> getRecentPredictions
 */
export async function getRealHistory() {
    return getRecentPredictions(100);
}

/**
 * Legacy support: getBankerStats
 */
export async function getBankerStats() {
    const stats = await calculateStats('all');
    return {
        streak: stats.streak?.count || 0,
        streakType: stats.streak?.type || 'none',
        accuracy: parseFloat(stats.winRate) || 0,
        totalPredictions: stats.total || 0
    };
}
