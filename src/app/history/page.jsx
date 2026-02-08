'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import { getRealHistory, syncRecentResults } from '@/lib/history-tracker';

export default function HistoryPage() {
    const { user, profile } = useAuth();
    const [predictions, setPredictions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, won, lost, pending
    const [sportFilter, setSportFilter] = useState('all');
    const [timeFilter, setTimeFilter] = useState('today'); // today, yesterday

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            // STEP 1: Get REAL history from DB immediately
            const historyData = await getRealHistory();
            if (historyData) {
                setPredictions(historyData);
                updateStats(historyData);
            }
            setLoading(false); // Show data to user now

            // STEP 2: Sync in background (don't block UI)
            console.log('🔄 Background sync starting...');
            syncRecentResults().then(async (result) => {
                if (result?.updated > 0) {
                    console.log(`✅ Background sync updated ${result.updated} matches. Refreshing...`);
                    const freshData = await getRealHistory();
                    setPredictions(freshData);
                    updateStats(freshData);
                }
            }).catch(e => console.warn('Background sync error:', e));

        } catch (error) {
            console.error('Error loading history:', error);
            setLoading(false);
        }
    }

    // Extracted stats calculation for reuse
    function updateStats(historyData) {
        if (!historyData || historyData.length === 0) {
            setStats(getEmptyStats());
            return;
        }
        const resolved = historyData.filter(p => p.status === 'won' || p.status === 'lost');
        const total = resolved.length;
        const correct = resolved.filter(p => p.status === 'won').length;
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

        // Calculate ROI based on odds and profit/loss
        const totalProfit = resolved.reduce((sum, p) => sum + (parseFloat(p.profit_loss) || 0), 0);
        const totalStaked = total * 10; // Assuming $10 flat stake as per history-tracker.js
        const roi = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0;

        // Confidence Tier Accuracy
        const tiers = {
            diamond: historyData.filter(p => p.confidence >= 70),
            gold: historyData.filter(p => p.confidence >= 55 && p.confidence < 70),
            silver: historyData.filter(p => p.confidence < 55)
        };

        const calcAcc = (list) => {
            const res = list.filter(p => p.status === 'won' || p.status === 'lost');
            if (res.length === 0) return { percentage: 0, count: 0, total: 0 };
            const won = res.filter(p => p.status === 'won').length;
            return {
                percentage: Math.round((won / res.length) * 100),
                count: won,
                total: res.length
            };
        };

        setStats({
            total,
            correct,
            accuracy,
            roi: roi.toFixed(1),
            tierStats: {
                diamond: calcAcc(tiers.diamond),
                gold: calcAcc(tiers.gold),
                silver: calcAcc(tiers.silver)
            }
        });
    }

    function getEmptyStats() {
        return {
            total: 0,
            correct: 0,
            accuracy: 0,
            roi: 0,
            tierStats: {
                diamond: { percentage: 0, count: 0, total: 0 },
                gold: { percentage: 0, count: 0, total: 0 },
                silver: { percentage: 0, count: 0, total: 0 }
            }
        };
    }

    const filteredPredictions = predictions.filter(p => {
        // Date filtering
        const pDate = new Date(p.start_date || p.match_date || p.created_at);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const isToday = pDate.toDateString() === today.toDateString();
        const isYesterday = pDate.toDateString() === yesterday.toDateString();

        if (timeFilter === 'today' && !isToday) return false;
        if (timeFilter === 'yesterday' && !isYesterday) return false;

        // Status/Sport filtering
        if (filter === 'won' && p.status !== 'won') return false;
        if (filter === 'lost' && p.status !== 'lost') return false;
        if (filter === 'pending' && p.status !== 'pending') return false;
        if (sportFilter !== 'all' && p.sport !== sportFilter) return false;
        return true;
    });

    // Re-calculate stats for the CURRENT filtered view only
    const currentStats = (() => {
        const resolved = filteredPredictions.filter(p => p.status === 'won' || p.status === 'lost');
        const total = resolved.length;
        const correct = resolved.filter(p => p.status === 'won').length;
        const lost = resolved.filter(p => p.status === 'lost').length;
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
        const totalProfit = resolved.reduce((sum, p) => sum + (parseFloat(p.profit_loss) || 0), 0);
        const totalStaked = total * 10;
        const roi = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0;

        return {
            total: filteredPredictions.length,
            correct,
            lost,
            accuracy,
            roi: roi.toFixed(1),
            tierStats: {
                diamond: calcTierAcc(filteredPredictions.filter(p => p.confidence >= 70)),
                gold: calcTierAcc(filteredPredictions.filter(p => p.confidence >= 55 && p.confidence < 70)),
                silver: calcTierAcc(filteredPredictions.filter(p => p.confidence < 55))
            }
        };
    })();

    function calcTierAcc(list) {
        const res = list.filter(p => p.status === 'won' || p.status === 'lost');
        if (res.length === 0) return { percentage: 0, count: 0, total: 0 };
        const won = res.filter(p => p.status === 'won').length;
        return {
            percentage: Math.round((won / res.length) * 100),
            count: won,
            total: res.length
        };
    }

    const sports = [...new Set(predictions.map(p => p.sport))];

    return (
        <div className="min-h-screen bg-grid">
            <div className="bg-glow"></div>
            <Header />

            <main className="relative z-10 pb-12" style={{ marginTop: '200px' }}>
                <div className="w-full mx-auto flex flex-col items-center" style={{ paddingLeft: '10%', paddingRight: '10%' }}>
                    {/* Header */}
                    <div className="mb-8 text-center w-full">
                        <h1 className="text-4xl font-bold text-white mb-2">
                            📊 Historial de Predicciones
                        </h1>
                        <p className="text-gray-400">
                            Registro público de todas las predicciones y resultados
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="w-full grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                        <StatCard
                            label={`Total ${timeFilter === 'today' ? 'Hoy' : 'Ayer'}`}
                            value={currentStats.total}
                            icon="📈"
                        />
                        <StatCard
                            label="Aciertos"
                            value={currentStats.correct}
                            icon="✅"
                            color="green"
                        />
                        <StatCard
                            label="Perdidas"
                            value={currentStats.lost}
                            icon="❌"
                            color="red"
                        />
                        <StatCard
                            label="Precisión"
                            value={`${currentStats.accuracy}%`}
                            icon="🎯"
                            color="cyan"
                        />
                        <StatCard
                            label="ROI"
                            value={`${parseFloat(currentStats.roi) > 0 ? '+' : ''}${currentStats.roi}%`}
                            icon="💰"
                            color={parseFloat(currentStats.roi) > 0 ? 'green' : 'red'}
                        />
                    </div>

                    {/* Accuracy by confidence chart (visual) */}
                    <div className="w-full glass-card p-6 mb-8">
                        <h2 className="text-xl font-bold text-white mb-4 text-center">📊 Precisión: {timeFilter === 'today' ? 'Hoy' : 'Ayer'}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ConfidenceBar
                                label="Diamond (70%+)"
                                correct={currentStats.tierStats.diamond.count}
                                total={currentStats.tierStats.diamond.total}
                                percentage={currentStats.tierStats.diamond.percentage}
                            />
                            <ConfidenceBar
                                label="Gold (55-69%)"
                                correct={currentStats.tierStats.gold.count}
                                total={currentStats.tierStats.gold.total}
                                percentage={currentStats.tierStats.gold.percentage}
                            />
                            <ConfidenceBar
                                label="Silver (<55%)"
                                correct={currentStats.tierStats.silver.count}
                                total={currentStats.tierStats.silver.total}
                                percentage={currentStats.tierStats.silver.percentage}
                            />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="w-full flex flex-wrap justify-between items-center gap-6 mb-8 glass-card p-4">
                        <div className="flex gap-1 bg-black/40 p-1 rounded-xl">
                            {['today', 'yesterday'].map(tf => (
                                <button
                                    key={tf}
                                    onClick={() => setTimeFilter(tf)}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all
                                    ${timeFilter === tf
                                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                                            : 'text-gray-500 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {tf === 'today' ? '📅 Hoy' : '⏪ Ayer'}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {['all', 'won', 'lost', 'pending'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all
                                    ${filter === f
                                            ? 'bg-white/10 text-white border border-white/20'
                                            : 'text-gray-500 hover:text-white'
                                        }`}
                                >
                                    {f === 'all' && 'Todas'}
                                    {f === 'won' && '✅ Ganadas'}
                                    {f === 'lost' && '❌ Perdidas'}
                                    {f === 'pending' && '⏳ En Juego'}
                                </button>
                            ))}
                        </div>

                        <select
                            value={sportFilter}
                            onChange={(e) => setSportFilter(e.target.value)}
                            className="bg-gray-800/50 text-white px-4 py-2 rounded-lg border border-white/5 text-sm"
                        >
                            <option value="all">Todos los deportes</option>
                            {sports.map(sport => (
                                <option key={sport} value={sport}>{sport}</option>
                            ))}
                        </select>
                    </div>

                    {/* Predictions List */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin text-4xl mb-4">⚽</div>
                            <p className="text-gray-400">Cargando historial...</p>
                        </div>
                    ) : filteredPredictions.length > 0 ? (
                        <div className="w-full space-y-4">
                            {filteredPredictions.map((pred, idx) => (
                                <PredictionRow key={idx} prediction={pred} />
                            ))}
                        </div>
                    ) : (
                        <div className="w-full text-center py-12 glass-card">
                            <span className="text-6xl mb-4 block">📭</span>
                            <p className="text-gray-400">No hay predicciones para mostrar</p>
                            {!user && (
                                <p className="text-sm text-gray-500 mt-2">
                                    Inicia sesión para ver tu historial personal
                                </p>
                            )}
                        </div>
                    )}

                    {/* Disclaimer */}
                    <div className="mt-12 text-center text-sm text-gray-500">
                        <p>⚠️ Historial verificable públicamente. Todas las predicciones son registradas antes del inicio del partido.</p>
                        <p className="mt-1">Las estadísticas se actualizan automáticamente cuando finalizan los partidos.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ label, value, icon, color = 'white' }) {
    const colorClasses = {
        white: 'text-white',
        green: 'text-green-400',
        red: 'text-red-400',
        cyan: 'text-cyan-400',
        yellow: 'text-yellow-400',
    };

    return (
        <div className="glass-card p-4 flex flex-col items-center justify-center text-center gap-1">
            <span className="text-3xl mb-1">{icon}</span>
            <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
            <div className={`text-3xl font-bold ${colorClasses[color]}`}>
                {value}
            </div>
        </div>
    );
}

function ConfidenceBar({ label, correct, total, percentage: forcedPct }) {
    const percentage = forcedPct !== undefined ? forcedPct : (total > 0 ? Math.round((correct / total) * 100) : 0);

    return (
        <div className="text-center">
            <div className="text-sm text-gray-400 mb-2">{label}</div>
            <div className="h-32 bg-gray-800 rounded-lg relative overflow-hidden">
                <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-500 to-cyan-400 transition-all"
                    style={{ height: `${percentage}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white drop-shadow-lg">{percentage}%</span>
                </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">{correct}/{total}</div>
        </div>
    );
}

function PredictionRow({ prediction }) {
    // Map DB status to UI boolean
    const isWon = prediction.was_correct === true || prediction.status === 'won';
    const isLost = prediction.was_correct === false || prediction.status === 'lost';
    const isPending = !isWon && !isLost; // pending or void

    return (
        <div className={`glass-card p-4 border-l-4 ${isWon ? 'border-green-500' :
            isLost ? 'border-red-500' :
                'border-gray-500'
            }`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-2xl">
                        {prediction.sport === 'football' ? '⚽' :
                            prediction.sport === 'basketball' ? '🏀' :
                                prediction.sport === 'tennis' ? '🎾' :
                                    prediction.sport === 'nfl' ? '🏈' :
                                        prediction.sport === 'baseball' ? '⚾' : '🏆'}
                    </span>
                    <div>
                        <div className="text-white font-medium">
                            {prediction.home_team} vs {prediction.away_team}
                        </div>
                        <div className="text-sm text-gray-400">
                            {prediction.predicted_market || `Gana ${prediction.predicted_winner}`}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-sm text-gray-400">
                            {new Date(prediction.match_date || prediction.created_at).toLocaleDateString('es-ES')}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-cyan-400 font-medium">{prediction.confidence}%</span>
                            {prediction.odds && (
                                <span className="text-gray-500">@ {prediction.odds}</span>
                            )}
                        </div>
                    </div>

                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl
                        ${isWon ? 'bg-green-500/20 text-green-400' :
                            isLost ? 'bg-red-500/20 text-red-400' :
                                'bg-gray-500/20 text-gray-400'}`}>
                        {isWon ? '✓' : isLost ? '✗' : '⏳'}
                    </div>
                </div>
            </div>

            {prediction.final_score && (
                <div className="mt-3 pt-3 border-t border-gray-700/50 flex justify-between items-center">
                    <span className="text-sm text-gray-400">Resultado Final: </span>
                    <span className="text-white font-mono font-bold bg-white/5 px-2 py-0.5 rounded">
                        {prediction.final_score.home} - {prediction.final_score.away}
                    </span>
                </div>
            )}

            {prediction.is_live_bridge && (
                <div className="mt-2 text-[10px] text-cyan-500 font-bold uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></span>
                    Sincronizado en Vivo
                </div>
            )}
        </div>
    );
}
