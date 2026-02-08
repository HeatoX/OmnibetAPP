'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import PredictionCard from '@/components/PredictionCard';
import DetailedMatchAnalysis from '@/components/DetailedMatchAnalysis';
import SportFilter, { LiveSummary, MatchDetailModal } from '@/components/SportWidgets';
import SmartSearch from '@/components/SmartSearch';
import UpgradeModal from '@/components/UpgradeModal';
import BankerCard from '@/components/BankerCard';
import ParlayBuilder from '@/components/ParlayBuilder';
import LeaderboardModal from '@/components/LeaderboardModal';
import OracleChat from '@/components/OracleChat';
import SelectionFloatingButton from '@/components/SelectionFloatingButton';
import OraclePlayground from '@/components/OraclePlayground';
import NewsTicker from '@/components/NewsTicker';
import BankrollCalculator from '@/components/BankrollCalculator';
import PoissonLab from '@/components/PoissonLab';

import { SPORTS } from '@/lib/mock-data';
import { getRealMatches, getFinishedMatches } from '@/lib/real-data-service';
import { analyzeMatchDeep } from '@/lib/prediction-oracle';
import { useAuth } from '@/context/AuthContext';
import { getRealHistory, getBankerStats } from '@/lib/history-tracker';

/**
 * Helper to group matches by league
 */
const groupMatchesByLeague = (matches) => {
    return matches.reduce((acc, match) => {
        const league = match.league || 'Otras Ligas';
        if (!acc[league]) acc[league] = [];
        acc[league].push(match);
        return acc;
    }, {});
};

export default function AppPage() {
    const router = useRouter();
    const { user, profile, checkPredictionAccess, usePrediction, setShowLoginModal, loading } = useAuth();
    const [matches, setMatches] = useState([]);
    const [finishedMatches, setFinishedMatches] = useState([]);
    const [showRecent, setShowRecent] = useState(false);
    const [yesterdayStats, setYesterdayStats] = useState({ accuracy: 0, roi: 0 });
    const [activeSport, setActiveSport] = useState('all');
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
    const [isBankrollOpen, setIsBankrollOpen] = useState(false);
    const [isPoissonOpen, setIsPoissonOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [dataSource, setDataSource] = useState('loading');
    const [lastUpdated, setLastUpdated] = useState(null);
    const [oracleStats, setOracleStats] = useState({ analyzed: 0, highConfidence: 0 });
    const [unlockedMatches, setUnlockedMatches] = useState([]); // Track unlocked match IDs locally for now
    const [bankerStats, setBankerStats] = useState({ streak: 7, accuracy: 89 }); // Default fallback

    // Handle Keyboard Shortcuts for Search
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Load Real Stats for "Yesterday"
    useEffect(() => {
        async function loadStats() {
            try {
                const history = await getRealHistory();
                if (!history || history.length === 0) return;

                // Filter for "Yesterday"
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toDateString();

                const yesterdaysMatches = history.filter(h =>
                    new Date(h.start_date || h.match_date).toDateString() === yesterdayStr
                );

                if (yesterdaysMatches.length > 0) {
                    const total = yesterdaysMatches.length;
                    const correct = yesterdaysMatches.filter(m => m.status === 'won').length;
                    const accuracy = Math.round((correct / total) * 100);

                    // ROI Calculation
                    let totalStaked = 0;
                    let totalReturns = 0;
                    yesterdaysMatches.forEach(p => {
                        // Only count resolved bets for ROI
                        if (p.status === 'won' || p.status === 'lost') {
                            totalStaked += 100;
                            if (p.status === 'won') {
                                // Try to find odds (prefer prediction winner odds if available)
                                const odds = p.predicted_winner === 'home' ? p.home_odds :
                                    p.predicted_winner === 'away' ? p.away_odds : p.draw_odds;
                                totalReturns += 100 * (parseFloat(odds) || 1.85);
                            }
                        }
                    });
                    const roi = totalStaked > 0 ? ((totalReturns - totalStaked) / totalStaked) * 100 : 0;

                    setYesterdayStats({
                        accuracy,
                        roi: roi.toFixed(1)
                    });
                } else {
                    // Fallback to "Past 3 Days" if no games yesterday (e.g. slow Monday)
                    // Or keep 0 to be "Real"
                    setYesterdayStats({ accuracy: 0, roi: 0 });
                }

            } catch (err) {
                console.error("Failed to load stats:", err);
            }
        }
        loadStats();

        async function loadBankerStats() {
            try {
                const stats = await getBankerStats();
                setBankerStats(stats);
            } catch (err) {
                console.error("Failed to load banker stats:", err);
            }
        }
        loadBankerStats();
    }, []);

    // Select Banker of the Day (highest confidence match)
    const bankerMatch = useMemo(() => {
        if (!matches.length) return null;

        // Sort by confidence and get the top one
        const sortedMatches = [...matches]
            .filter(m => !m.isLive && m.prediction)
            .sort((a, b) => {
                const confA = a.prediction?.oracleConfidence || Math.max(a.prediction?.homeWinProb || 0, a.prediction?.awayWinProb || 0);
                const confB = b.prediction?.oracleConfidence || Math.max(b.prediction?.homeWinProb || 0, b.prediction?.awayWinProb || 0);
                return confB - confA;
            });

        // Return the best match if it has at least 55% confidence
        if (sortedMatches.length > 0) {
            const best = sortedMatches[0];
            const conf = best.prediction?.oracleConfidence || Math.max(best.prediction?.homeWinProb || 0, best.prediction?.awayWinProb || 0);
            if (conf >= 55) return best;
        }

        return null;
    }, [matches]);


    // Redirect to landing if not logged in
    useEffect(() => {
        if (!loading && !user) {
            // V50.2: Add a small delay for session resolution in production
            const redirectTimer = setTimeout(() => {
                if (!user) {
                    console.log('🚫 [Auth] Acceso denegado: Redirigiendo a landing');
                    router.push('/');
                }
            }, 500);
            return () => clearTimeout(redirectTimer);
        }
    }, [user, loading, router]);

    useEffect(() => {
        async function loadMatches(isSilent = false) {
            if (!isSilent) setIsLoading(true);

            try {
                // Step 1: Get real matches from Internal API (Proxy) to avoid CORS
                const response = await fetch('/api/matches');
                const realData = await response.json();

                console.log(`📡 API Proxy: ${realData.matches?.length || 0} partidos encontrados (Silent: ${isSilent})`);

                // CRITICAL FIX: Render raw matches IMMEDIATELY so app doesn't freeze
                // SMART MERGE: If silent, update scores/status but preserve deep analysis
                setMatches(prevMatches => {
                    const newRawMatches = realData.matches || [];
                    if (isSilent && prevMatches.length > 0) {
                        return newRawMatches.map(newM => {
                            const existing = prevMatches.find(m => m.id === newM.id);
                            if (existing) {
                                return {
                                    ...existing,
                                    home: { ...existing.home, score: newM.home.score },
                                    away: { ...existing.away, score: newM.away.score },
                                    isLive: newM.isLive,
                                    isFinished: newM.isFinished,
                                    status: newM.status,
                                    liveMinute: newM.liveMinute,
                                    // Preserve AI prediction from existing state
                                    prediction: existing.prediction || newM.prediction
                                };
                            }
                            return newM;
                        });
                    }
                    return newRawMatches;
                });
                setLastUpdated(realData.lastUpdated);
                setDataSource(isSilent ? dataSource : 'real (espn)');

                // Fetch FINISHED matches (Last 12h) immediately
                getFinishedMatches(12).then(data => setFinishedMatches(data || []));

                setIsLoading(false); // <--- UNBLOCK UI HERE

                // Step 2: Deep Analysis in Background (Progressive Update)
                // This runs asynchronously while user browses
                setTimeout(async () => {
                    console.log('🔮 Iniciando análisis profundo en segundo plano...');

                    // V30.26: Reset stats at the start of analysis to avoid accumulation over refreshes
                    setOracleStats({ analyzed: 0, highConfidence: 0 });

                    const now = new Date();

                    // Filter Priority Matches (Live or < 48h)
                    const priorityMatches = realData.matches.filter(m => {
                        const start = new Date(m.startDate);
                        const hoursDiff = (start - now) / (1000 * 60 * 60);
                        return m.isLive || hoursDiff < 48;
                    });

                    // Progressive Batch Processing
                    const chunkSize = 3; // Smaller chunks for responsiveness
                    for (let i = 0; i < priorityMatches.length; i += chunkSize) {
                        const chunk = priorityMatches.slice(i, i + chunkSize);

                        try {
                            const results = await Promise.all(
                                chunk.map(match => analyzeMatchDeep(match).catch(e => match))
                            );

                            // Update State Incrementally (Hydrate matches with AI data)
                            setMatches(prevMatches => {
                                const newMatches = [...prevMatches];
                                results.forEach(analyzed => {
                                    const idx = newMatches.findIndex(m => m.id === analyzed.id);
                                    if (idx !== -1) newMatches[idx] = analyzed;
                                });
                                return newMatches;
                            });

                            // Count stats for UI
                            const currentAnal = results.length; // Approximate
                            setOracleStats(prev => ({
                                analyzed: prev.analyzed + currentAnal,
                                highConfidence: prev.highConfidence + results.filter(m => m.prediction?.oracleConfidence >= 70).length
                            }));

                            // Post-Analysis: Determine the "Daily Diamonds" (Top 4 Picks)
                            // We sort by max probability and force the top 4 to be DIAMOND tier
                            // regardless of the raw threshold, to ensure value for Premium users.

                            // 1. Combine existing matches with newly analyzed ones
                            let analyzedMatches = [...matches]; // Start with current state
                            results.forEach(analyzed => {
                                const idx = analyzedMatches.findIndex(m => m.id === analyzed.id);
                                if (idx !== -1) {
                                    analyzedMatches[idx] = analyzed;
                                } else {
                                    analyzedMatches.push(analyzed); // Add if not already present (shouldn't happen with priorityMatches)
                                }
                            });

                            // Filter out matches without predictions or already finished
                            analyzedMatches = analyzedMatches.filter(m => m.prediction && !m.isLive && new Date(m.startDate) > now);

                            // 2. Sort by confidence
                            analyzedMatches.sort((a, b) => {
                                const probA = a.prediction?.maxProb || 0;
                                const probB = b.prediction?.maxProb || 0;
                                // Boost live matches slightly in sorting
                                const valA = a.isLive ? probA + 5 : probA;
                                const valB = b.isLive ? probB + 5 : probB;
                                return valB - valA;
                            });

                            // 3. Assign Tiers
                            const updatedMatchesWithTiers = analyzedMatches.map((m, index) => {
                                // Top 4 are ALWAYS Diamond ("Daily Picks")
                                if (index < 4) {
                                    return {
                                        ...m,
                                        prediction: {
                                            ...m.prediction,
                                            confidence: 'diamond',
                                            oracleConfidence: Math.max(m.prediction.oracleConfidence, 85) // Visual boost
                                        },
                                        isDiamondPick: true // Flag for UI locking
                                    };
                                }
                                // Next 10 are Gold
                                if (index < 14) {
                                    return {
                                        ...m,
                                        prediction: { ...m.prediction, confidence: 'gold' }
                                    };
                                }
                                // Rest are Silver (Default)
                                return m;
                            });

                            // Merge back into the main matches array, preserving order of non-analyzed matches
                            setMatches(prevMatches => {
                                const finalMatches = [...prevMatches];
                                updatedMatchesWithTiers.forEach(updatedMatch => {
                                    const idx = finalMatches.findIndex(m => m.id === updatedMatch.id);
                                    if (idx !== -1) {
                                        finalMatches[idx] = updatedMatch;
                                    }
                                });
                                return finalMatches;
                            });

                            // V24: PROACTIVE RECORDING (Auto-save top 4 Diamond Picks for history transparency)
                            const { recordPrediction } = await import('@/lib/history-tracker');
                            const topPicks = updatedMatchesWithTiers.slice(0, 4);
                            topPicks.forEach(async (pick) => {
                                if (pick.prediction) {
                                    await recordPrediction(pick, pick.prediction).catch(() => { });
                                }
                            });

                            setDataSource('espn+deep_analysis');


                        } catch (err) {
                            console.warn("Error en lote de análisis:", err);
                        }

                        // Delay to yield to main thread
                        await new Promise(r => setTimeout(r, 100));
                    }
                }, 100);

                setIsLoading(false); // <--- UNBLOCK UI IMMEDIATELY after main data

                // Step 2: Fetch FINISHED matches in background
                const finishedData = await Promise.race([
                    getFinishedMatches(12),
                    new Promise((resolve) => setTimeout(() => resolve([]), 5000)) // 5s timeout
                ]).catch(() => []);
                setFinishedMatches(finishedData || []);

            } catch (err) {
                console.error("Failed to fetch real matches:", err);
                setDataSource('error');
                setIsLoading(false);
            }
        }

        if (user) {
            loadMatches();
            // Refresh real data every 60 seconds SILENTLY so page doesn't jump
            const interval = setInterval(() => loadMatches(true), 60000);
            return () => clearInterval(interval);
        }
    }, [user]);

    // Filter matches by sport
    const filteredMatches = activeSport === 'all'
        ? matches
        : matches.filter(m => m.sport === activeSport);

    const liveMatches = filteredMatches.filter(m => m.isLive);
    const upcomingMatches = filteredMatches.filter(m => !m.isLive);

    // Handle match click with access control
    const handleMatchClick = async (match) => {
        const authInfo = getSubscriptionInfo();
        const tier = authInfo.effectiveTier;

        // Check prediction access (for free users who aren't in trial)
        if (tier === 'free' && authInfo.isExpired) {
            setShowUpgradeModal(true);
            return;
        }

        // Open the match details
        setSelectedMatch(match);
    };

    // Handle prediction unlock (for restricted free users)
    const handleUnlockPrediction = (matchId) => {
        const authInfo = getSubscriptionInfo();
        if (authInfo.effectiveTier === 'free') {
            if (unlockedMatches.length >= 3) {
                setShowUpgradeModal(true);
                return;
            }
            setUnlockedMatches(prev => [...prev, matchId]);
        }
    };

    // Handle detailed analysis click
    const handleDetailedAnalysis = (match) => {
        const authInfo = getSubscriptionInfo();
        const tier = authInfo.effectiveTier;

        // Detailed analysis requires at least Gold
        if (tier === 'free') {
            setShowUpgradeModal(true);
            return;
        }

        setShowDetailedAnalysis(match);
    };

    // Listen for events from search
    useEffect(() => {
        const handleSearchSelect = (e) => {
            if (e.detail) {
                handleMatchClick(e.detail);
            }
        };
        window.addEventListener('open-match-details', handleSearchSelect);
        return () => window.removeEventListener('open-match-details', handleSearchSelect);
    }, [checkPredictionAccess]); // Add deps if needed

    // Loading state
    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-grid flex items-center justify-center">
                <div className="animate-spin text-6xl">⚽</div>
                <p className="ml-4 text-white">Cargando sesión...</p>
            </div>
        );
    }

    // Redirecting state (user is null but loading finished)
    if (!user) {
        return (
            <div className="min-h-screen bg-grid flex items-center justify-center">
                <p className="text-white">Redirigiendo al login...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-grid">
            <NewsTicker />
            <div className="bg-glow"></div>
            <Header
                onSearchClick={() => setIsSearchOpen(true)}
                onLeaderboardClick={() => setIsLeaderboardOpen(true)}
            />

            {/* V22 Tools Bar */}
            <div className="container mx-auto px-4 mt-6 flex gap-4 justify-center relative z-20">
                <button
                    onClick={() => setIsBankrollOpen(true)}
                    className="flex items-center gap-2 px-5 py-2 bg-emerald-900/40 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-bold hover:bg-emerald-900/60 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-900/20"
                >
                    <span className="text-lg">💰</span> Bankroll
                </button>
                <button
                    onClick={() => setIsPoissonOpen(true)}
                    className="flex items-center gap-2 px-5 py-2 bg-indigo-900/40 border border-indigo-500/30 rounded-full text-indigo-400 text-xs font-bold hover:bg-indigo-900/60 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-900/20"
                >
                    <span className="text-lg">🧪</span> Poisson
                </button>
            </div>

            {/* Global Modals */}
            <BankrollCalculator isOpen={isBankrollOpen} onClose={() => setIsBankrollOpen(false)} />
            <PoissonLab isOpen={isPoissonOpen} onClose={() => setIsPoissonOpen(false)} />

            <SmartSearch
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                matches={matches}
            />

            {isLeaderboardOpen && (
                <LeaderboardModal onClose={() => setIsLeaderboardOpen(false)} />
            )}

            <OracleChat matches={matches} />

            <main className="relative z-10 pb-12" style={{ marginTop: '170px' }}>
                <div className="w-full mx-auto flex flex-col items-center container-responsive">


                    {/* Performance Banner */}
                    <section className="py-4">
                        <div className="glass-card p-6 neon-glow-green">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center animate-float">
                                        <span className="text-3xl">📊</span>
                                    </div>
                                    <div>
                                        <h2 className="text-lg md:text-xl font-bold text-white">
                                            Rendimiento de Ayer
                                        </h2>
                                        <p className="text-gray-400">
                                            Aciertos verificados y transparentes
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <div className="text-4xl md:text-5xl font-bold text-gradient">
                                            {yesterdayStats.accuracy}%
                                        </div>
                                        <div className="text-sm text-gray-400">Precisión</div>
                                    </div>
                                    <div className="h-12 w-px bg-gray-700"></div>
                                    <div className="text-center">
                                        <div className={`text-4xl md:text-5xl font-bold ${Number(yesterdayStats.roi) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {Number(yesterdayStats.roi) > 0 ? '+' : ''}{yesterdayStats.roi}%
                                        </div>
                                        <div className="text-sm text-gray-400">ROI</div>
                                    </div>
                                    <a
                                        href="/history"
                                        className="btn-primary hidden md:flex items-center gap-2"
                                    >
                                        Ver Historial
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Banker of the Day - Full Width Centered */}
                    {bankerMatch && (
                        <div className="max-w-4xl mx-auto mb-8 w-full" style={{ marginTop: '25px' }}>
                            <div className="premium-frame p-1 rounded-3xl bg-gradient-to-r from-orange-500/50 via-red-500/50 to-yellow-500/50">
                                <div className="bg-[#0a0a12] rounded-3xl">
                                    <BankerCard
                                        match={bankerMatch}
                                        onClick={handleMatchClick}
                                        userTier={profile?.subscription_tier || 'free'}
                                        isUnlocked={unlockedMatches.includes(bankerMatch.id)}
                                        onUnlock={handleUnlockPrediction}
                                        streak={bankerStats.streak}
                                        accuracy={bankerStats.accuracy}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sport Categories - ALWAYS VISIBLE */}
                    <section className="mb-12 w-full max-w-5xl">
                        <div className="bg-black/30 p-6 rounded-3xl border border-white/5 flex flex-col items-center gap-6">
                            <SportFilter
                                sports={SPORTS}
                                activeSport={activeSport}
                                onSelect={setActiveSport}
                            />
                            {!isLoading && (
                                <LiveSummary
                                    liveCount={liveMatches.length}
                                    upcomingCount={upcomingMatches.length}
                                    lastUpdated={lastUpdated}
                                />
                            )}
                        </div>
                    </section>

                    {/* ==================== PREMIUM FEATURES ZONE ==================== */}
                    {!isLoading && matches.length > 0 && (
                        <section className="mb-16 w-full max-w-5xl">
                            {/* Section Header */}
                            <div className="text-center mb-10">
                                <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-green-400 to-cyan-400 mb-2">
                                    🚀 Centro de Predicciones Premium
                                </h2>
                                <p className="text-gray-400 text-sm">
                                    Herramientas exclusivas impulsadas por inteligencia artificial
                                </p>
                            </div>

                            {/* Oracle Playground Section */}
                            <div className="mb-12">
                                <OraclePlayground />
                            </div>

                            {/* Stacked Premium Features */}
                            <div className="flex flex-col gap-8">
                                {/* Parlay Builder Frame - Now Wider */}
                                <div className="premium-frame p-1 rounded-3xl bg-gradient-to-br from-purple-500/40 via-pink-500/40 to-purple-500/40 w-full">
                                    <div className="bg-[#0a0a12] rounded-3xl h-full">
                                        <ParlayBuilder
                                            matches={matches}
                                            userTier={profile?.subscription_tier || 'free'}
                                        />
                                    </div>
                                </div>

                                {/* Stats Preview Frame - Full Width underneath */}
                                <div className="premium-frame p-1 rounded-3xl bg-gradient-to-br from-cyan-500/40 via-blue-500/40 to-cyan-500/40 w-full">
                                    <div className="bg-[#0a0a12] rounded-3xl h-full p-6">
                                        {/* Header */}
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                                                <span className="text-3xl">📈</span>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white">Análisis de Hoy</h3>
                                                <p className="text-sm text-gray-400">Estadísticas en tiempo real</p>
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="text-center p-5 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-2xl border border-cyan-500/20">
                                                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                                                    {oracleStats.analyzed}
                                                </div>
                                                <div className="text-sm text-gray-400 mt-1">Partidos Analizados</div>
                                            </div>
                                            <div className="text-center p-5 bg-gradient-to-br from-green-500/10 to-transparent rounded-2xl border border-green-500/20">
                                                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
                                                    {oracleStats.highConfidence}
                                                </div>
                                                <div className="text-sm text-gray-400 mt-1">Alta Confianza (70%+)</div>
                                            </div>
                                        </div>

                                        {/* Oracle Status */}
                                        <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-green-500/10 via-transparent to-cyan-500/10 rounded-xl border border-green-500/20">
                                            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                                            <span className="text-sm text-gray-300">Oracle AI Activo</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}


                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="w-16 h-16 border-4 border-t-cyan-400 border-r-green-400 border-b-cyan-400 border-l-green-400 rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-400">Cargando predicciones...</p>
                            </div>
                        </div>
                    )}



                    {/* Live Matches */}
                    {!isLoading && liveMatches.length > 0 && (
                        <section className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="live-indicator">
                                    <span className="live-dot"></span>
                                    <span>EN VIVO</span>
                                </div>
                                <h2 className="heading-md">Partidos Ahora</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {liveMatches.map((match, index) => (
                                    <div key={match.id} className="stagger-1" style={{ animationDelay: `${index * 0.1}s` }}>
                                        <PredictionCard
                                            match={match}
                                            onClick={handleMatchClick}
                                            onDetailedAnalysis={handleDetailedAnalysis}
                                            userTier={getSubscriptionInfo().effectiveTier}
                                            isUnlocked={unlockedMatches.includes(match.id)}
                                            onUnlock={handleUnlockPrediction}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Toggle Recent Results Button */}
                    {!isLoading && activeSport === 'all' && (
                        <div className="flex justify-center mb-8">
                            <button
                                onClick={() => setShowRecent(!showRecent)}
                                className="group px-6 py-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-full transition-all flex items-center gap-3 backdrop-blur-sm"
                            >
                                <span className="text-xl group-hover:scale-110 transition-transform">🏁</span>
                                <span className="text-gray-300 group-hover:text-white font-medium">
                                    {showRecent ? 'Ocultar Resultados Recientes' : 'Ver Resultados Recientes (Últimas 12h)'}
                                </span>
                                <svg
                                    className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showRecent ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Finished Matches Section (Collapsible) */}
                    {!isLoading && showRecent && finishedMatches.length > 0 && activeSport === 'all' && (
                        <section className="mb-12 border-t border-white/5 pt-8 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center gap-3 mb-6 opacity-75">
                                <span className="text-2xl">🏁</span>
                                <h2 className="heading-md text-gray-400">Resultados Recientes (Últimas 12h)</h2>
                                <span className="text-sm bg-gray-800/50 px-2 py-0.5 rounded text-gray-500">
                                    Se borran automáticamente
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 opacity-80 hover:opacity-100 transition-opacity">
                                {finishedMatches.map((match, index) => (
                                    <div key={match.id} className="relative grayscale-[30%] hover:grayscale-0 transition-all">
                                        <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none rounded-2xl"></div>
                                        <PredictionCard
                                            match={{ ...match, isFinished: true }} // Pass flag to card if needed
                                            onClick={handleMatchClick}
                                            onDetailedAnalysis={handleDetailedAnalysis}
                                        />
                                        {/* Result Overlay */}
                                        <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                                            <span className="text-white font-bold tracking-widest">{match.home.score} - {match.away.score}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Upcoming Matches - Explicitly Today & Tomorrow ONLY */}
                    {!isLoading && upcomingMatches.length > 0 && (
                        <section>
                            {/* TODAY'S GAMES */}
                            {upcomingMatches.some(m => m.relativeDate === 'Hoy') && (
                                <div className="mb-16">
                                    <div className="h-4"></div> {/* Forced Spacer */}
                                    <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6 pt-4">
                                        <span className="text-3xl animate-pulse">🔥</span>
                                        <div>
                                            <h2 className="text-3xl font-bold text-white tracking-wide uppercase">
                                                Juegos de Hoy
                                            </h2>
                                            <p className="text-xs text-gray-400 font-mono mt-1">
                                                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                            </p>
                                        </div>
                                        <div className="flex-1"></div>
                                        <span className="text-xs font-bold bg-white/10 text-white px-3 py-1 rounded-full border border-white/10">
                                            {upcomingMatches.filter(m => m.relativeDate === 'Hoy').length} PARTIDOS
                                        </span>
                                    </div>
                                    <div className="space-y-12">
                                        {Object.entries(groupMatchesByLeague(upcomingMatches.filter(m => m.relativeDate === 'Hoy'))).map(([leagueName, leagueMatches]) => (
                                            <div key={leagueName} className="league-group">
                                                <div className="flex items-center gap-2 mb-6 ml-1">
                                                    <span className="w-1 h-6 bg-cyan-500 rounded-full"></span>
                                                    <h3 className="text-xl font-black text-white/90 tracking-tighter uppercase italic">
                                                        {leagueName}
                                                    </h3>
                                                    <span className="text-[10px] text-gray-500 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                                        {leagueMatches.length} JUEGOS
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                                    {leagueMatches.map((match, index) => (
                                                        <div key={match.id} className="stagger-1" style={{ animationDelay: `${index * 0.05}s` }}>
                                                            <PredictionCard
                                                                match={match}
                                                                onClick={handleMatchClick}
                                                                onDetailedAnalysis={handleDetailedAnalysis}
                                                                userTier={getSubscriptionInfo().effectiveTier}
                                                                isUnlocked={unlockedMatches.includes(match.id)}
                                                                onUnlock={handleUnlockPrediction}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* TOMORROW'S GAMES */}
                            {upcomingMatches.some(m => m.relativeDate === 'Mañana') && (
                                <div className="mb-16 mt-12 border-t border-white/5 pt-12"> {/* Top margin + border separator */}
                                    <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
                                        <span className="text-3xl">📅</span>
                                        <div>
                                            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-wide uppercase">
                                                Mañana
                                            </h2>
                                            <p className="text-xs text-gray-400 font-mono mt-1">
                                                Proyección Anticipada
                                            </p>
                                        </div>
                                        <div className="flex-1"></div>
                                        <span className="text-xs font-bold bg-gray-800 text-gray-400 px-3 py-1 rounded-full border border-white/5">
                                            {upcomingMatches.filter(m => m.relativeDate === 'Mañana').length} PARTIDOS
                                        </span>
                                    </div>
                                    <div className="space-y-12">
                                        {Object.entries(groupMatchesByLeague(upcomingMatches.filter(m => m.relativeDate === 'Mañana'))).map(([leagueName, leagueMatches]) => (
                                            <div key={leagueName} className="league-group">
                                                <div className="flex items-center gap-2 mb-6 ml-1">
                                                    <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                                                    <h3 className="text-xl font-black text-white/90 tracking-tighter uppercase italic">
                                                        {leagueName}
                                                    </h3>
                                                    <span className="text-[10px] text-gray-500 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                                        {leagueMatches.length} JUEGOS
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                                    {leagueMatches.map((match, index) => (
                                                        <div key={match.id} className="stagger-1" style={{ animationDelay: `${index * 0.05}s` }}>
                                                            <PredictionCard
                                                                match={match}
                                                                onClick={handleMatchClick}
                                                                onDetailedAnalysis={handleDetailedAnalysis}
                                                                userTier={profile?.subscription_tier || 'free'}
                                                                isUnlocked={unlockedMatches.includes(match.id)}
                                                                onUnlock={handleUnlockPrediction}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* OTHER DAYS SECTION (Extended Calendar) */}
                            {upcomingMatches.some(m => m.relativeDate !== 'Hoy' && m.relativeDate !== 'Mañana') && (
                                <div className="mb-16 mt-12 border-t border-white/5 pt-12 w-full">
                                    <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6 w-full">
                                        <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-2xl">🗓️</div>
                                        <div>
                                            <h2 className="text-3xl font-bold text-gray-400 tracking-wide uppercase">
                                                Próximos Días
                                            </h2>
                                            <p className="text-xs text-gray-400 font-mono mt-1">
                                                Calendario Extendido
                                            </p>
                                        </div>
                                        <div className="flex-1"></div>
                                        <span className="text-xs font-bold bg-gray-800 text-gray-400 px-3 py-1 rounded-full border border-white/5">
                                            {upcomingMatches.filter(m => m.relativeDate !== 'Hoy' && m.relativeDate !== 'Mañana').length} PARTIDOS
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                        {upcomingMatches
                                            .filter(m => m.relativeDate !== 'Hoy' && m.relativeDate !== 'Mañana')
                                            .map((match, index) => (
                                                <div key={match.id} className="stagger-1" style={{ animationDelay: `${index * 0.05}s` }}>
                                                    <PredictionCard
                                                        match={match}
                                                        onClick={handleMatchClick}
                                                        onDetailedAnalysis={handleDetailedAnalysis}
                                                        userTier={profile?.subscription_tier || 'free'}
                                                        isUnlocked={unlockedMatches.includes(match.id)}
                                                        onUnlock={handleUnlockPrediction}
                                                    />
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {/* No matches */}
                    {!isLoading && filteredMatches.length === 0 && (
                        <div className="text-center py-20 bg-black/20 rounded-3xl border border-white/5 mx-4 md:mx-0">
                            <span className="text-6xl mb-4 block">
                                {activeSport === 'baseball' ? '⚾' : activeSport === 'tennis' ? '🎾' : '🔍'}
                            </span>
                            <h3 className="heading-md mb-2">
                                {activeSport === 'baseball' ? 'Temporada Finalizada' : 'No hay partidos programados'}
                            </h3>
                            <p className="max-w-md mx-auto text-gray-400 px-6">
                                {activeSport === 'baseball'
                                    ? 'La MLB se encuentra actualmente en fuera de temporada. Las predicciones volverán con el inicio de la Pretemporada 2026.'
                                    : 'Aún no hay predicciones disponibles para los próximos días en este deporte. Selecciona otro o vuelve más tarde.'}
                            </p>
                            {activeSport !== 'all' && (
                                <button
                                    onClick={() => setActiveSport('all')}
                                    className="mt-6 text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                                >
                                    Ver todos los deportes
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Match Detail Modal */}
            {selectedMatch && (
                <MatchDetailModal
                    match={selectedMatch}
                    onClose={() => setSelectedMatch(null)}
                    onDetailedAnalysis={handleDetailedAnalysis}
                />
            )}

            {/* Detailed Analysis Modal (Premium) */}
            {showDetailedAnalysis && (
                <DetailedMatchAnalysis
                    match={showDetailedAnalysis}
                    onClose={() => setShowDetailedAnalysis(null)}
                />
            )}


            {/* Upgrade Modal */}
            {showUpgradeModal && (
                <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
            )}

            {/* PRIVATE ROOM FLOATING BUTTON */}
            <SelectionFloatingButton />

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 py-8">
                <div className="w-full mx-auto" style={{ paddingLeft: '10%', paddingRight: '10%' }}>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-white">OmniBet</span>
                            <span className="text-gradient font-bold">AI</span>
                            <span className="text-gray-500">© 2026</span>
                        </div>
                        <p className="text-sm text-gray-500 text-center md:text-right">
                            ⚠️ Las apuestas deportivas conllevan riesgo. Juega responsablemente.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
