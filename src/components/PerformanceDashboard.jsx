'use client';

import { useState, useEffect } from 'react';

/**
 * Performance Dashboard Component
 * Shows AI prediction accuracy and statistics
 */
export default function PerformanceDashboard({ data, overallStats }) {
    const [animatedStats, setAnimatedStats] = useState({
        accuracy: 0,
        predictions: 0,
        roi: 0,
    });

    useEffect(() => {
        // Animate counters
        const duration = 2000;
        const steps = 60;
        const interval = duration / steps;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic

            setAnimatedStats({
                accuracy: Math.round(eased * (overallStats?.accuracy || 0)),
                predictions: Math.round(eased * (overallStats?.totalPredictions || 0)),
                roi: (eased * parseFloat(overallStats?.roi || 0)).toFixed(1),
            });

            if (step >= steps) clearInterval(timer);
        }, interval);

        return () => clearInterval(timer);
    }, [overallStats]);

    // Calculate week totals
    const weekTotals = data?.reduce((acc, day) => ({
        total: acc.total + day.total,
        correct: acc.correct + day.correct,
    }), { total: 0, correct: 0 }) || { total: 0, correct: 0 };

    const weekAccuracy = weekTotals.total > 0
        ? Math.round((weekTotals.correct / weekTotals.total) * 100)
        : 0;

    return (
        <div className="space-y-6">
            {/* Main Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-5 text-center">
                    <div className="stat-value">{animatedStats.accuracy}%</div>
                    <div className="stat-label">Precisión Total</div>
                </div>
                <div className="glass-card p-5 text-center">
                    <div className="stat-value">{animatedStats.predictions.toLocaleString()}</div>
                    <div className="stat-label">Predicciones</div>
                </div>
                <div className="glass-card p-5 text-center">
                    <div className="stat-value text-gradient-premium">+{animatedStats.roi}%</div>
                    <div className="stat-label">ROI Total</div>
                </div>
                <div className="glass-card p-5 text-center">
                    <div className="stat-value">{overallStats?.winStreak || 0}</div>
                    <div className="stat-label">Racha Actual</div>
                </div>
            </div>

            {/* Confidence Level Stats */}
            <div className="glass-card p-6">
                <h3 className="heading-md mb-4">Precisión por Nivel de Confianza</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
                        <div className="badge-diamond inline-block mb-2">💎 DIAMANTE</div>
                        <div className="text-3xl font-bold text-cyan-400">
                            {overallStats?.diamondAccuracy || 0}%
                        </div>
                        <div className="text-sm text-gray-400 mt-1">Alta confianza</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
                        <div className="badge-gold inline-block mb-2">🥇 ORO</div>
                        <div className="text-3xl font-bold text-yellow-400">
                            {overallStats?.goldAccuracy || 0}%
                        </div>
                        <div className="text-sm text-gray-400 mt-1">Confianza moderada</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-gray-500/10 to-gray-600/10 border border-gray-500/30">
                        <div className="badge-silver inline-block mb-2">🥈 PLATA</div>
                        <div className="text-3xl font-bold text-gray-400">
                            {overallStats?.silverAccuracy || 0}%
                        </div>
                        <div className="text-sm text-gray-400 mt-1">Valor detectado</div>
                    </div>
                </div>
            </div>

            {/* Weekly Chart */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="heading-md">Rendimiento Semanal</h3>
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-400">
                            Esta semana: <span className="text-white font-bold">{weekAccuracy}%</span>
                        </span>
                        <span className="text-gray-400">
                            Aciertos: <span className="text-green-400 font-bold">{weekTotals.correct}</span>/{weekTotals.total}
                        </span>
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="flex items-end justify-between gap-2 h-48 pt-4">
                    {data?.map((day, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                            <div className="relative w-full flex flex-col items-center" style={{ height: '160px' }}>
                                {/* Correct predictions bar */}
                                <div
                                    className="absolute bottom-0 w-full rounded-t-lg transition-all duration-1000"
                                    style={{
                                        height: `${(day.correct / (Math.max(...data.map(d => d.total)) || 1)) * 100}%`,
                                        background: 'linear-gradient(180deg, #00ff88, #00d4ff)',
                                        opacity: 0.9,
                                        animationDelay: `${index * 0.1}s`
                                    }}
                                >
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-white">
                                        {day.accuracy}%
                                    </div>
                                </div>
                                {/* Total predictions bar (background) */}
                                <div
                                    className="absolute bottom-0 w-full rounded-t-lg bg-gray-700/50"
                                    style={{
                                        height: `${(day.total / (Math.max(...data.map(d => d.total)) || 1)) * 100}%`,
                                        zIndex: -1
                                    }}
                                ></div>
                            </div>
                            <div className="text-xs text-gray-400">{day.day}</div>
                            <div className="text-xs text-gray-500">{day.date}</div>
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-800">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-gradient-to-r from-green-400 to-cyan-400"></div>
                        <span className="text-sm text-gray-400">Aciertos</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-gray-700"></div>
                        <span className="text-sm text-gray-400">Total predicciones</span>
                    </div>
                </div>
            </div>

            {/* Sport Breakdown */}
            <div className="glass-card p-6">
                <h3 className="heading-md mb-4">Precisión por Deporte</h3>
                <div className="space-y-4">
                    {Object.entries(overallStats?.sportStats || {}).map(([sport, stats]) => (
                        <div key={sport} className="flex items-center gap-4">
                            <span className="text-2xl w-10">
                                {sport === 'football' ? '⚽' :
                                    sport === 'basketball' ? '🏀' :
                                        sport === 'baseball' ? '⚾' :
                                            sport === 'nfl' ? '🏈' : '🎾'}
                            </span>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-white font-medium capitalize">
                                        {sport === 'nfl' ? 'NFL' : sport}
                                    </span>
                                    <span className="text-sm text-gray-400">
                                        {stats.predictions} predicciones
                                    </span>
                                </div>
                                <div className="probability-bar">
                                    <div
                                        className="probability-fill"
                                        style={{
                                            width: `${stats.accuracy}%`,
                                            background: stats.accuracy > 70
                                                ? 'linear-gradient(90deg, #00ff88, #00d4ff)'
                                                : stats.accuracy > 60
                                                    ? 'linear-gradient(90deg, #ffd700, #ff6b35)'
                                                    : '#ff6b35'
                                        }}
                                    ></div>
                                </div>
                            </div>
                            <span className="font-bold text-lg w-14 text-right">{stats.accuracy}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
