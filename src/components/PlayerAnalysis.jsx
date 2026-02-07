'use client';

import { useState, useEffect } from 'react';

/**
 * Player Analysis Card
 * Deep dive into individual player stats and predictions
 */
export default function PlayerAnalysisCard({ player, onClose }) {
    const [isLoading, setIsLoading] = useState(true);
    const [playerData, setPlayerData] = useState(null);

    useEffect(() => {
        // Simulate AI agent analysis
        setTimeout(() => {
            setPlayerData(generatePlayerAnalysis(player));
            setIsLoading(false);
        }, 800);
    }, [player]);

    if (isLoading) {
        return (
            <div className="glass-card p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                        <div className="h-6 bg-gray-700 rounded w-1/2 mb-2"></div>
                        <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="h-4 bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-cyan-400 rounded-full flex items-center justify-center text-2xl font-bold text-black">
                        {playerData.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">{playerData.name}</h3>
                        <p className="text-gray-400">{playerData.team} • {playerData.position}</p>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Form Rating */}
            <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="text-center p-3 bg-black/30 rounded-xl">
                    <div className="text-2xl font-bold text-gradient">{playerData.form.rating}</div>
                    <div className="text-xs text-gray-400">Rating</div>
                </div>
                <div className="text-center p-3 bg-black/30 rounded-xl">
                    <div className="text-2xl font-bold text-white">{playerData.stats.goals}</div>
                    <div className="text-xs text-gray-400">Goles</div>
                </div>
                <div className="text-center p-3 bg-black/30 rounded-xl">
                    <div className="text-2xl font-bold text-white">{playerData.stats.assists}</div>
                    <div className="text-xs text-gray-400">Asistencias</div>
                </div>
                <div className="text-center p-3 bg-black/30 rounded-xl">
                    <div className="text-2xl font-bold text-white">{playerData.stats.minutesPlayed}</div>
                    <div className="text-xs text-gray-400">Minutos</div>
                </div>
            </div>

            {/* Physical Status */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-400 mb-3">📊 Estado Físico</h4>
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Condición física</span>
                            <span className="text-white font-medium">{playerData.physical.fitness}%</span>
                        </div>
                        <div className="probability-bar">
                            <div
                                className="probability-fill"
                                style={{
                                    width: `${playerData.physical.fitness}%`,
                                    background: playerData.physical.fitness > 80
                                        ? 'linear-gradient(90deg, #00ff88, #00d4ff)'
                                        : playerData.physical.fitness > 60
                                            ? 'linear-gradient(90deg, #ffd700, #ff6b35)'
                                            : '#ff0080'
                                }}
                            ></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Índice de fatiga</span>
                            <span className="text-white font-medium">{playerData.physical.fatigue}%</span>
                        </div>
                        <div className="probability-bar">
                            <div
                                className="probability-fill"
                                style={{
                                    width: `${playerData.physical.fatigue}%`,
                                    background: playerData.physical.fatigue < 30
                                        ? '#00ff88'
                                        : playerData.physical.fatigue < 60
                                            ? '#ffd700'
                                            : '#ff0080'
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Injury Risk */}
            {playerData.injuryRisk && (
                <div className={`p-4 rounded-xl mb-6 ${playerData.injuryRisk.level === 'high' ? 'bg-red-500/10 border border-red-500/30' :
                        playerData.injuryRisk.level === 'medium' ? 'bg-yellow-500/10 border border-yellow-500/30' :
                            'bg-green-500/10 border border-green-500/30'
                    }`}>
                    <div className="flex items-center gap-2">
                        <span className={`text-lg ${playerData.injuryRisk.level === 'high' ? 'text-red-400' :
                                playerData.injuryRisk.level === 'medium' ? 'text-yellow-400' :
                                    'text-green-400'
                            }`}>
                            {playerData.injuryRisk.level === 'high' ? '⚠️' :
                                playerData.injuryRisk.level === 'medium' ? '⚡' : '✅'}
                        </span>
                        <span className="font-medium text-white">
                            Riesgo de lesión: {playerData.injuryRisk.percentage}%
                        </span>
                    </div>
                    {playerData.injuryRisk.reason && (
                        <p className="text-sm text-gray-400 mt-1 ml-7">{playerData.injuryRisk.reason}</p>
                    )}
                </div>
            )}

            {/* Pre-match Alerts */}
            {playerData.alerts && playerData.alerts.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">🔔 Alertas Pre-Partido</h4>
                    <div className="space-y-2">
                        {playerData.alerts.map((alert, idx) => (
                            <div
                                key={idx}
                                className={`p-3 rounded-lg flex items-start gap-3 ${alert.type === 'negative' ? 'bg-red-500/10' :
                                        alert.type === 'positive' ? 'bg-green-500/10' :
                                            'bg-gray-500/10'
                                    }`}
                            >
                                <span className="text-lg">
                                    {alert.type === 'negative' ? '❌' : alert.type === 'positive' ? '✅' : 'ℹ️'}
                                </span>
                                <div>
                                    <p className="text-white text-sm">{alert.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{alert.source} • {alert.impact}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Predictions */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-400 mb-3">🎯 Predicciones IA</h4>
                <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-gradient-to-br from-green-500/10 to-cyan-500/10 rounded-xl border border-green-500/30">
                        <div className="text-2xl font-bold text-green-400">{playerData.predictions.goal}%</div>
                        <div className="text-xs text-gray-400">Prob. Gol</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/30">
                        <div className="text-2xl font-bold text-blue-400">{playerData.predictions.assist}%</div>
                        <div className="text-xs text-gray-400">Prob. Asist.</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/30">
                        <div className="text-2xl font-bold text-yellow-400">{playerData.predictions.card}%</div>
                        <div className="text-xs text-gray-400">Prob. Tarjeta</div>
                    </div>
                </div>
            </div>

            {/* Recent Form */}
            <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-3">📈 Últimos 5 Partidos</h4>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {playerData.recentMatches.map((match, idx) => (
                        <div key={idx} className="flex-shrink-0 w-24 p-3 bg-black/30 rounded-xl text-center">
                            <div className="text-xs text-gray-500 mb-1">{match.opponent}</div>
                            <div className={`text-lg font-bold ${match.rating >= 7 ? 'text-green-400' :
                                    match.rating >= 6 ? 'text-yellow-400' :
                                        'text-red-400'
                                }`}>
                                {match.rating}
                            </div>
                            <div className="text-xs text-gray-400">
                                {match.goals > 0 ? `⚽${match.goals}` : ''}
                                {match.assists > 0 ? ` 🅰️${match.assists}` : ''}
                                {match.goals === 0 && match.assists === 0 ? '-' : ''}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Generate mock player analysis data
function generatePlayerAnalysis(playerName) {
    const positions = ['GK', 'CB', 'RB', 'LB', 'CDM', 'CM', 'CAM', 'RW', 'LW', 'ST'];
    const teams = ['Real Madrid', 'Barcelona', 'Manchester City', 'Liverpool', 'Bayern Munich'];

    const rating = (6.5 + Math.random() * 2.5).toFixed(1);
    const fitness = 60 + Math.floor(Math.random() * 40);
    const fatigue = Math.floor(Math.random() * 50);

    // Generate alerts based on random conditions
    const alerts = [];

    if (Math.random() > 0.6) {
        alerts.push({
            type: 'positive',
            message: `${playerName} entrenó al 100% esta semana`,
            source: 'Comunicado oficial',
            impact: '+5% rendimiento esperado'
        });
    }

    if (Math.random() > 0.7) {
        alerts.push({
            type: 'negative',
            message: 'Molestias musculares en el entrenamiento de ayer',
            source: 'Fuentes cercanas',
            impact: 'Podría no ser titular'
        });
    }

    if (Math.random() > 0.8) {
        alerts.push({
            type: 'neutral',
            message: 'Rueda de prensa programada antes del partido',
            source: 'Calendario oficial',
            impact: 'Sin impacto directo'
        });
    }

    return {
        name: playerName,
        team: teams[Math.floor(Math.random() * teams.length)],
        position: positions[Math.floor(Math.random() * positions.length)],
        form: {
            rating,
            trend: parseFloat(rating) > 7 ? 'up' : parseFloat(rating) < 6.5 ? 'down' : 'stable'
        },
        stats: {
            goals: Math.floor(Math.random() * 15),
            assists: Math.floor(Math.random() * 10),
            minutesPlayed: 800 + Math.floor(Math.random() * 1500),
            matches: 15 + Math.floor(Math.random() * 20)
        },
        physical: {
            fitness,
            fatigue,
            lastRestDays: Math.floor(Math.random() * 5),
        },
        injuryRisk: {
            level: fatigue > 40 ? 'medium' : fatigue > 60 ? 'high' : 'low',
            percentage: Math.floor(10 + Math.random() * (fatigue > 40 ? 40 : 20)),
            reason: fatigue > 40 ? 'Carga de partidos acumulada' : null
        },
        predictions: {
            goal: 20 + Math.floor(Math.random() * 40),
            assist: 15 + Math.floor(Math.random() * 30),
            card: 5 + Math.floor(Math.random() * 20)
        },
        alerts,
        recentMatches: Array(5).fill(null).map(() => ({
            opponent: ['ATM', 'BAR', 'SEV', 'VAL', 'BET'][Math.floor(Math.random() * 5)],
            rating: (5.5 + Math.random() * 4).toFixed(1),
            goals: Math.random() > 0.7 ? Math.floor(1 + Math.random() * 2) : 0,
            assists: Math.random() > 0.8 ? 1 : 0,
        }))
    };
}

/**
 * AI Analysis Summary Component
 * Shows how many agents analyzed the match
 */
export function AIAnalysisSummary({ agentReports }) {
    const totalAgents = agentReports?.length || 10;
    const completedAgents = agentReports?.filter(r => r.success).length || totalAgents;

    return (
        <div className="glass-card p-4 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                        <span className="text-xl">🐝</span>
                    </div>
                    <div>
                        <h4 className="font-bold text-white">Colmena IA Activa</h4>
                        <p className="text-sm text-gray-400">
                            {completedAgents} agentes analizando en paralelo
                        </p>
                    </div>
                </div>

                <div className="flex gap-1">
                    {Array(totalAgents).fill(null).map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${i < completedAgents ? 'bg-green-400' : 'bg-gray-600'
                                }`}
                            style={{ animationDelay: `${i * 0.1}s` }}
                        ></div>
                    ))}
                </div>
            </div>

            {/* Agent Types */}
            <div className="mt-4 flex flex-wrap gap-2">
                {[
                    { name: 'Stats Scout', icon: '📊', status: 'active' },
                    { name: 'News Agent', icon: '📰', status: 'active' },
                    { name: 'Social Sentiment', icon: '💬', status: 'active' },
                    { name: 'Odds Tracker', icon: '💰', status: 'active' },
                    { name: 'Weather Agent', icon: '🌤️', status: 'active' },
                    { name: 'Player Analyst', icon: '👤', status: 'active' },
                    { name: 'Team Analyst', icon: '⚽', status: 'active' },
                    { name: 'H2H Expert', icon: '🔄', status: 'active' },
                    { name: 'Form Analyst', icon: '📈', status: 'active' },
                    { name: 'Injury Scout', icon: '🏥', status: 'active' },
                ].map((agent, idx) => (
                    <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-black/30 rounded-full text-xs"
                    >
                        <span>{agent.icon}</span>
                        <span className="text-gray-400">{agent.name}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    </span>
                ))}
            </div>
        </div>
    );
}
