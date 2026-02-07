'use client';

import { useState, useEffect } from 'react';

/**
 * Transparency Stats Component
 * Public display of prediction performance for building trust
 */
export default function TransparencyStats({ stats, isPublic = false }) {
    const [selectedPeriod, setSelectedPeriod] = useState('week');

    if (!stats) {
        return (
            <div className="transparency-stats glass-card p-6 animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 bg-gray-700 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    const periods = [
        { id: 'today', label: 'Hoy' },
        { id: 'week', label: 'Semana' },
        { id: 'month', label: 'Mes' },
        { id: 'all', label: 'Total' }
    ];

    return (
        <div className="transparency-stats">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">📊</span>
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            Historial de Rendimiento
                        </h2>
                        <p className="text-sm text-gray-400">
                            Resultados verificables y transparentes
                        </p>
                    </div>
                </div>

                {/* Period Selector */}
                <div className="flex gap-2">
                    {periods.map(period => (
                        <button
                            key={period.id}
                            onClick={() => setSelectedPeriod(period.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedPeriod === period.id
                                    ? 'bg-cyan-500 text-black'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            {period.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {/* Win Rate */}
                <div className="glass-card p-4 text-center border border-green-500/30">
                    <div className="text-3xl font-black text-green-400">{stats.winRate}%</div>
                    <div className="text-sm text-gray-400">Tasa de Acierto</div>
                    <div className="text-xs text-gray-500 mt-1">
                        {stats.wins}W - {stats.losses}L
                    </div>
                </div>

                {/* ROI */}
                <div className={`glass-card p-4 text-center border ${parseFloat(stats.roi) >= 0 ? 'border-green-500/30' : 'border-red-500/30'
                    }`}>
                    <div className={`text-3xl font-black ${parseFloat(stats.roi) >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                        {parseFloat(stats.roi) >= 0 ? '+' : ''}{stats.roi}%
                    </div>
                    <div className="text-sm text-gray-400">ROI</div>
                    <div className="text-xs text-gray-500 mt-1">
                        Retorno sobre inversión
                    </div>
                </div>

                {/* Total Profit */}
                <div className={`glass-card p-4 text-center border ${parseFloat(stats.totalProfit) >= 0 ? 'border-cyan-500/30' : 'border-red-500/30'
                    }`}>
                    <div className={`text-3xl font-black ${parseFloat(stats.totalProfit) >= 0 ? 'text-cyan-400' : 'text-red-400'
                        }`}>
                        ${stats.totalProfit}
                    </div>
                    <div className="text-sm text-gray-400">Ganancia</div>
                    <div className="text-xs text-gray-500 mt-1">
                        (Apuestas de $10)
                    </div>
                </div>

                {/* Current Streak */}
                <div className={`glass-card p-4 text-center border ${stats.streak?.type === 'win' ? 'border-purple-500/30' : 'border-orange-500/30'
                    }`}>
                    <div className={`text-3xl font-black ${stats.streak?.type === 'win' ? 'text-purple-400' : 'text-orange-400'
                        }`}>
                        {stats.streak?.count || 0}
                    </div>
                    <div className="text-sm text-gray-400">
                        Racha {stats.streak?.type === 'win' ? '✅' : '❌'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        {stats.streak?.type === 'win' ? 'Aciertos seguidos' : 'Fallos seguidos'}
                    </div>
                </div>
            </div>

            {/* Tier Breakdown */}
            <div className="glass-card p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-4">
                    Rendimiento por Nivel de Confianza
                </h3>
                <div className="space-y-3">
                    {/* Diamond */}
                    <div className="flex items-center gap-4">
                        <div className="w-24 flex items-center gap-2">
                            <span>💎</span>
                            <span className="text-sm text-gray-300">Diamante</span>
                        </div>
                        <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                                style={{ width: `${stats.tierStats?.diamond?.winRate || 0}%` }}
                            />
                        </div>
                        <div className="w-20 text-right">
                            <span className="font-bold text-cyan-400">{stats.tierStats?.diamond?.winRate || 0}%</span>
                            <span className="text-xs text-gray-500 ml-1">({stats.tierStats?.diamond?.total || 0})</span>
                        </div>
                    </div>

                    {/* Gold */}
                    <div className="flex items-center gap-4">
                        <div className="w-24 flex items-center gap-2">
                            <span>🥇</span>
                            <span className="text-sm text-gray-300">Oro</span>
                        </div>
                        <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-500 to-orange-400 rounded-full"
                                style={{ width: `${stats.tierStats?.gold?.winRate || 0}%` }}
                            />
                        </div>
                        <div className="w-20 text-right">
                            <span className="font-bold text-yellow-400">{stats.tierStats?.gold?.winRate || 0}%</span>
                            <span className="text-xs text-gray-500 ml-1">({stats.tierStats?.gold?.total || 0})</span>
                        </div>
                    </div>

                    {/* Silver */}
                    <div className="flex items-center gap-4">
                        <div className="w-24 flex items-center gap-2">
                            <span>🥈</span>
                            <span className="text-sm text-gray-300">Plata</span>
                        </div>
                        <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-gray-400 to-gray-500 rounded-full"
                                style={{ width: `${stats.tierStats?.silver?.winRate || 0}%` }}
                            />
                        </div>
                        <div className="w-20 text-right">
                            <span className="font-bold text-gray-400">{stats.tierStats?.silver?.winRate || 0}%</span>
                            <span className="text-xs text-gray-500 ml-1">({stats.tierStats?.silver?.total || 0})</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Top Predictions */}
            {stats.topPredictions && stats.topPredictions.length > 0 && (
                <div className="glass-card p-4">
                    <h3 className="text-sm font-medium text-gray-400 mb-4">
                        🏆 Últimos Aciertos Destacados
                    </h3>
                    <div className="space-y-2">
                        {stats.topPredictions.map((pred, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0"
                            >
                                <div>
                                    <p className="text-sm font-medium text-white">{pred.match}</p>
                                    <p className="text-xs text-gray-400">{pred.prediction}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-green-400">+${pred.profit?.toFixed(2)}</p>
                                    <p className="text-xs text-gray-500">@ {pred.odds}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Trust Badge */}
            {isPublic && (
                <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
                        <span className="text-green-400">✓</span>
                        <span className="text-sm text-gray-300">
                            Estadísticas verificables y actualizadas en tiempo real
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
