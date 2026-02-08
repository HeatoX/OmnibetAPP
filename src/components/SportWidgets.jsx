'use client';

import { useState, useEffect } from 'react';

/**
 * Sport Filter Tabs Component
 */
export default function SportFilter({ sports, activeSport, onSelect }) {
    return (
        <div className="flex flex-nowrap md:flex-wrap items-center justify-center gap-2 md:gap-4 overflow-x-auto no-scrollbar w-full pb-2">
            <button
                className={`sport-tab ${activeSport === 'all' ? 'active' : ''}`}
                onClick={() => onSelect('all')}
            >
                <span className="icon">🌍</span>
                <span>Todos</span>
            </button>

            {Object.entries(sports).map(([key, sport]) => (
                <button
                    key={key}
                    className={`sport-tab ${activeSport === key ? 'active' : ''}`}
                    onClick={() => onSelect(key)}
                    style={{
                        '--sport-color': sport.color,
                        borderColor: activeSport === key ? sport.color : 'transparent'
                    }}
                >
                    <span className="icon">{sport.icon}</span>
                    <span className="sm:inline">{sport.name}</span>
                </button>
            ))}
        </div>
    );
}

/**
 * Live Match Summary Widget
 */
export function LiveSummary({ liveCount, upcomingCount, lastUpdated }) {
    const [pulse, setPulse] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setPulse(p => !p);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-white/5 hover:bg-white/10 transition-colors px-6 py-3 rounded-full flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 cursor-default border border-white/5">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-red-500 ${pulse ? 'opacity-100' : 'opacity-40'} transition-opacity shadow-[0_0_8px_rgba(239,68,68,0.5)]`}></div>
                    <span className="text-white font-bold text-sm tracking-wide">{liveCount} EN VIVO</span>
                </div>
                <div className="h-4 w-px bg-white/10 hidden md:block"></div>
                <span className="text-gray-400 text-sm font-medium">{upcomingCount} próximos partidos</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 bg-black/20 px-3 py-1 rounded-full">
                <span>Actualizado:</span>
                <span className="text-gray-300 font-mono">
                    {lastUpdated || new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
}

/**
 * Match Detail Modal
 */
import { useProfile } from '@/context/ProfileContext';

/**
 * Match Detail Modal
 */
export function MatchDetailModal({ match, onClose, onDetailedAnalysis }) {
    const { profile } = useProfile();
    const userProfile = profile; // Alias for compatibility with existing logic

    // Handler when user clicks upgrade button
    const onUpgrade = () => {
        // Trigger upgrade modal using existing parent handler
        if (onDetailedAnalysis) {
            onClose(); // Close this modal first
            onDetailedAnalysis(match); // This will trigger the upgrade modal in parent if user is free/silver
        } else {
            // Fallback
            window.location.href = '/pricing';
        }
    };

    if (!match) return null;

    // Check if logo is a URL string or emoji
    const isUrl = (str) => str && typeof str === 'string' && str.startsWith('http');

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

            {/* Modal */}
            <div
                className="relative glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn"
                onClick={e => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-white p-2"
                    onClick={onClose}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Content */}
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-3xl">{match.sportIcon}</span>
                        <div>
                            <h2 className="heading-md">{match.home?.name} vs {match.away?.name}</h2>
                            <p className="text-gray-400">{match.league}</p>
                        </div>
                    </div>

                    {/* Teams with proper logo handling */}
                    <div className="flex items-center justify-between bg-black/30 rounded-xl p-6 mb-6">
                        <div className="text-center flex-1">
                            <div className="team-logo team-logo-lg mx-auto mb-2">
                                {isUrl(match.home?.logo) ? (
                                    <img src={match.home.logo} alt={match.home?.name} className="w-full h-full object-contain" />
                                ) : (
                                    <span className="text-4xl">{match.sportIcon}</span>
                                )}
                            </div>
                            <div className="font-bold text-xl text-white">{match.home?.name}</div>
                            {match.isLive && (
                                <div className="score-display text-4xl mt-2">{match.home?.score}</div>
                            )}
                        </div>
                        <div className="px-6 text-center">
                            {match.isLive ? (
                                <div className="live-indicator">
                                    <span className="live-dot"></span>
                                    <span>{match.liveMinute}</span>
                                </div>
                            ) : (
                                <div>
                                    <div className="text-2xl text-gray-500 mb-1">VS</div>
                                    <div className="text-white font-mono text-lg">{match.startTime}</div>
                                    <div className="text-xs text-gray-500">{match.displayDate}</div>
                                </div>
                            )}
                        </div>
                        <div className="text-center flex-1">
                            <div className="team-logo team-logo-lg mx-auto mb-2">
                                {isUrl(match.away?.logo) ? (
                                    <img src={match.away.logo} alt={match.away?.name} className="w-full h-full object-contain" />
                                ) : (
                                    <span className="text-4xl">{match.sportIcon}</span>
                                )}
                            </div>
                            <div className="font-bold text-xl text-white">{match.away?.name}</div>
                            {match.isLive && (
                                <div className="score-display text-4xl mt-2">{match.away?.score}</div>
                            )}
                        </div>
                    </div>

                    {/* AI Prediction with Oracle Confidence */}
                    <div className="glass-card p-5 mb-6" style={{ background: 'rgba(0, 255, 136, 0.05)' }}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">🔮</span>
                                <h3 className="font-bold text-lg text-white">Predicción del Oráculo</h3>
                            </div>
                            {match.prediction?.oracleConfidence && (
                                <div className={`px-3 py-1 rounded-full text-sm font-bold ${match.prediction.oracleConfidence >= 70 ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                                    match.prediction.oracleConfidence >= 60 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                                        'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                                    }`}>
                                    {match.prediction.oracleConfidence}% Confianza
                                </div>
                            )}
                        </div>
                        <p className="text-gradient text-2xl font-bold mb-3">{match.prediction?.text}</p>
                        <p className="text-gray-300">{match.prediction?.reasoning}</p>
                    </div>

                    {/* Market Predictions (Tiered Gating) */}
                    {(() => {
                        // Gating Logic
                        const tier = userProfile?.subscription_tier || 'free';
                        const predictions = match.playerPredictions?.filter(p => p.probability >= 50) || [];
                        let visibleCount = 2; // Default Silver/Free

                        if (tier === 'gold') visibleCount = 4;
                        if (tier === 'diamond' || userProfile?.is_admin) visibleCount = 999; // Show all

                        const visiblePredictions = predictions.slice(0, visibleCount);
                        const lockedPredictions = predictions.slice(visibleCount);

                        return (
                            <div className="mb-6">
                                <h3 className="font-bold text-lg text-white mb-3">
                                    🎯 Mercados Inteligentes & Predicciones
                                </h3>

                                {predictions.length > 0 ? (
                                    <div className="space-y-2">
                                        {/* Visible Predictions */}
                                        {visiblePredictions.map((pred, idx) => (
                                            <div key={idx} className={`glass-card p-4 flex items-center justify-between border ${pred.probability >= 70 ? 'border-green-500/30' : 'border-gray-600/30'}`}>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">{pred.icon || '✅'}</span>
                                                    <div>
                                                        <span className="font-medium text-white">{pred.team}</span>
                                                        {pred.prediction && (
                                                            <span className="text-gray-400 text-sm ml-2">{pred.prediction}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-xs px-3 py-1 rounded border ${pred.probability >= 70 ? 'badge-diamond' : 'text-gray-400 border-gray-600'}`}>
                                                        {pred.probability}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Locked Content Check */}
                                        {lockedPredictions.length > 0 && (
                                            <div className="glass-card p-4 border border-yellow-500/30 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                                                    <div className="text-center p-4">
                                                        <div className="text-2xl mb-2">🔒</div>
                                                        <h4 className="font-bold text-white mb-1">
                                                            +{lockedPredictions.length} Predicciones Premium
                                                        </h4>
                                                        <p className="text-sm text-gray-400 mb-3">
                                                            {tier === 'free' ? 'Actualiza a Diamond para ver todo' : 'Actualiza tu plan'}
                                                        </p>
                                                        <button
                                                            onClick={onUpgrade}
                                                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
                                                        >
                                                            Desbloquear Todo
                                                        </button>
                                                    </div>
                                                </div>
                                                {/* Fake Blurred Content behind */}
                                                <div className="opacity-0">
                                                    {lockedPredictions.map((pred, idx) => (
                                                        <div key={idx} className="p-2">Mock Content</div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="glass-card p-4 border border-gray-600/30 text-center">
                                        <span className="text-gray-400">⚠️ No hay predicciones disponibles.</span>
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    {/* Stats - Sport Specific */}
                    {match.stats && (
                        <div className="mb-6">
                            <h3 className="font-bold text-lg text-white mb-3">📊 Estadísticas</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Football stats */}
                                {match.stats.homeXG && (
                                    <>
                                        <div className="glass-card p-4 text-center">
                                            <div className="text-2xl font-bold text-gradient">{match.stats.homeXG}</div>
                                            <div className="text-sm text-gray-400">xG {match.home?.name}</div>
                                        </div>
                                        <div className="glass-card p-4 text-center">
                                            <div className="text-2xl font-bold text-gradient">{match.stats.awayXG}</div>
                                            <div className="text-sm text-gray-400">xG {match.away?.name}</div>
                                        </div>
                                    </>
                                )}
                                {match.stats.homePossession && (
                                    <>
                                        <div className="glass-card p-4 text-center">
                                            <div className="text-2xl font-bold text-white">{match.stats.homePossession}%</div>
                                            <div className="text-sm text-gray-400">Posesión esperada</div>
                                        </div>
                                        <div className="glass-card p-4 text-center">
                                            <div className="text-2xl font-bold text-white">{100 - match.stats.homePossession}%</div>
                                            <div className="text-sm text-gray-400">Posesión esperada</div>
                                        </div>
                                    </>
                                )}
                                {/* Tennis stats */}
                                {match.stats.homeAces !== undefined && (
                                    <>
                                        <div className="glass-card p-4 text-center">
                                            <div className="text-2xl font-bold text-gradient">{match.stats.homeAces}</div>
                                            <div className="text-sm text-gray-400">🎾 Aces {match.home?.name}</div>
                                        </div>
                                        <div className="glass-card p-4 text-center">
                                            <div className="text-2xl font-bold text-gradient">{match.stats.awayAces}</div>
                                            <div className="text-sm text-gray-400">🎾 Aces {match.away?.name}</div>
                                        </div>
                                        <div className="glass-card p-4 text-center">
                                            <div className="text-2xl font-bold text-white">{match.stats.homeFirstServe}</div>
                                            <div className="text-sm text-gray-400">1er Servicio</div>
                                        </div>
                                        <div className="glass-card p-4 text-center">
                                            <div className="text-2xl font-bold text-white">{match.stats.awayFirstServe}</div>
                                            <div className="text-sm text-gray-400">1er Servicio</div>
                                        </div>
                                    </>
                                )}
                                {/* Basketball stats */}
                                {match.stats.homePPG && (
                                    <>
                                        <div className="glass-card p-4 text-center">
                                            <div className="text-2xl font-bold text-gradient">{match.stats.homePPG}</div>
                                            <div className="text-sm text-gray-400">🏀 PPG {match.home?.name}</div>
                                        </div>
                                        <div className="glass-card p-4 text-center">
                                            <div className="text-2xl font-bold text-gradient">{match.stats.awayPPG}</div>
                                            <div className="text-sm text-gray-400">🏀 PPG {match.away?.name}</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    {match.stats?.homeForm && (
                        <div className="mb-6">
                            <h3 className="font-bold text-lg text-white mb-3">📈 Forma Reciente</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-400 text-sm mb-2">{match.home?.name}</p>
                                    <div className="flex gap-1">
                                        {match.stats.homeForm.map((result, idx) => (
                                            <span
                                                key={idx}
                                                className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold ${result === 'W' ? 'bg-green-500/20 text-green-400' :
                                                    result === 'D' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-red-500/20 text-red-400'
                                                    }`}
                                            >
                                                {result}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm mb-2">{match.away?.name}</p>
                                    <div className="flex gap-1">
                                        {match.stats.awayForm.map((result, idx) => (
                                            <span
                                                key={idx}
                                                className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold ${result === 'W' ? 'bg-green-500/20 text-green-400' :
                                                    result === 'D' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-red-500/20 text-red-400'
                                                    }`}
                                            >
                                                {result}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CTA */}
                    <div className="flex gap-3">
                        <button className="btn-primary flex-1">
                            🎯 Guardar Predicción
                        </button>
                        <button className="btn-secondary flex-1">
                            📤 Compartir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
