'use client';

import { useState, useEffect } from 'react';
import { generateDailyParlay, formatParlayForShare } from '@/lib/parlay-engine';

/**
 * Parlay Builder Component
 * Premium feature for generating optimized multi-bet tickets
 */
export default function ParlayBuilder({ matches, userTier = 'free' }) {
    const [riskLevel, setRiskLevel] = useState('balanced');
    const [parlay, setParlay] = useState(null);
    const [copied, setCopied] = useState(false);
    const [isLocked, setIsLocked] = useState(userTier === 'free');

    useEffect(() => {
        if (matches && matches.length > 0) {
            const generated = generateDailyParlay(matches, riskLevel);
            setParlay(generated);
        }
    }, [matches, riskLevel]);

    const handleCopy = async () => {
        if (!parlay) return;
        const text = formatParlayForShare(parlay);
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const riskLevels = [
        { id: 'safe', label: '🛡️ Seguro', sublabel: '3 picks, 70%+' },
        { id: 'balanced', label: '⚖️ Equilibrado', sublabel: '4 picks, 60%+' },
        { id: 'aggressive', label: '🔥 Agresivo', sublabel: '5 picks, 55%+' }
    ];

    if (isLocked) {
        return (
            <div className="parlay-builder glass-card p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="text-center p-6">
                        <div className="text-5xl mb-4">🔒</div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            Generador de Combinadas
                        </h3>
                        <p className="text-gray-400 mb-4">
                            Desbloquea esta función con el plan Gold o Diamond
                        </p>
                        <button className="btn-gradient">
                            ⬆️ Upgrade Ahora
                        </button>
                    </div>
                </div>

                {/* Blurred preview */}
                <div className="opacity-30 blur-sm pointer-events-none">
                    <h3 className="text-lg font-bold text-white mb-4">🎰 Combinada del Día</h3>
                    <div className="h-48 bg-gray-800/50 rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="parlay-builder glass-card p-6 border border-purple-500/30 neon-glow-purple">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">🎰</span>
                    <div>
                        <h3 className="text-lg font-bold text-white">Combinada del Día</h3>
                        <p className="text-sm text-gray-400">Generada automáticamente por IA</p>
                    </div>
                </div>
                {parlay && (
                    <div className="text-right">
                        <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                            {parlay.combinedOdds}x
                        </div>
                        <div className="text-xs text-gray-400">Cuota Total</div>
                    </div>
                )}
            </div>

            {/* Risk Level Selector */}
            <div className="flex gap-2 mb-6">
                {riskLevels.map(level => (
                    <button
                        key={level.id}
                        onClick={() => setRiskLevel(level.id)}
                        className={`flex-1 p-3 rounded-xl text-center transition-all ${riskLevel === level.id
                            ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-500'
                            : 'bg-gray-800/50 border border-gray-700 hover:border-gray-600'
                            }`}
                    >
                        <div className="font-bold text-white">{level.label}</div>
                        <div className="text-xs text-gray-400">{level.sublabel}</div>
                    </button>
                ))}
            </div>

            {/* Parlay Selections */}
            {parlay ? (
                <div className="space-y-4 mb-8">
                    {parlay.selections.map((sel, idx) => (
                        <div
                            key={sel.matchId}
                            className="bg-black/40 rounded-2xl p-4 md:p-5 pr-6 md:pr-8 flex items-center justify-between gap-4 border border-white/5"
                        >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 w-6">
                                    {idx + 1}
                                </span>
                                <span className="text-2xl opacity-80">{sel.sportIcon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-white text-base truncate pr-2" title={sel.match}>
                                        {sel.match}
                                    </p>
                                    <p className="text-xs text-gray-400 truncate">{sel.league}</p>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="font-bold text-green-400 text-base">{sel.prediction}</p>
                                <div className="flex items-center justify-end gap-1 text-sm text-gray-400">
                                    <span>@</span>
                                    <span className="font-mono text-white">{sel.odds}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-400">
                    <span className="text-4xl mb-4 block">🤔</span>
                    <p>No hay suficientes partidos de alta confianza para generar una combinada</p>
                </div>
            )}

            {/* Footer Stats & Actions */}
            {parlay && (
                <div className="border-t border-gray-700 pt-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                            <div className="text-xl font-bold text-white">{parlay.selections.length}</div>
                            <div className="text-xs text-gray-400">Selecciones</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-green-400">${parlay.potentialReturn}</div>
                            <div className="text-xs text-gray-400">Retorno ($10)</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-yellow-400">{parlay.combinedProbability}%</div>
                            <div className="text-xs text-gray-400">Confianza Proyectada</div>
                        </div>
                    </div>

                    <button
                        onClick={handleCopy}
                        className={`w-full py-3 rounded-xl font-bold transition-all ${copied
                            ? 'bg-green-500 text-black'
                            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90'
                            }`}
                    >
                        {copied ? '✅ ¡Copiado!' : '📋 Copiar Combinada'}
                    </button>
                </div>
            )}
        </div>
    );
}
