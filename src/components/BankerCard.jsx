'use client';

import { useState, useEffect } from 'react';

/**
 * Banker of the Day Card - Ultra Premium Design
 * The single safest bet of the day with maximum visual impact
 */
export default function BankerCard({ match, onClick, userTier = 'free', isUnlocked = false, onUnlock, streak = 0, accuracy = 85 }) {
    const [countdown, setCountdown] = useState('');
    const [isHot, setIsHot] = useState(true);

    useEffect(() => {
        if (!match?.startDate) return;

        const updateCountdown = () => {
            const now = new Date();
            const matchTime = new Date(match.startDate);
            const diff = matchTime - now;

            if (diff <= 0) {
                setCountdown('¡EN JUEGO!');
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (hours > 24) {
                const days = Math.floor(hours / 24);
                setCountdown(`${days}d ${hours % 24}h`);
            } else {
                setCountdown(`${hours}h ${minutes}m`);
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 60000);
        return () => clearInterval(interval);
    }, [match?.startDate]);

    // Pulsing effect
    useEffect(() => {
        const interval = setInterval(() => setIsHot(h => !h), 1500);
        return () => clearInterval(interval);
    }, []);

    if (!match) return null;

    const confidence = match.prediction?.oracleConfidence ||
        Math.max(match.prediction?.homeWinProb || 0,
            match.prediction?.awayWinProb || 0);

    // Locking Logic
    const isLocked = userTier === 'free' && !isUnlocked;

    return (
        <div
            className="banker-card relative overflow-hidden cursor-pointer group"
            onClick={() => onClick?.(match)}
        >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/30 via-red-600/20 to-yellow-600/30 animate-pulse" />
            <div className="absolute inset-0 bg-[url('/fire-pattern.svg')] opacity-10" />

            {/* FREE PLAN LOCK OVERLAY */}
            {isLocked && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-6 text-center border-2 border-orange-500/30 rounded-3xl">
                    <div className="w-16 h-16 rounded-full bg-orange-900/50 flex items-center justify-center mb-4 animate-bounce border border-orange-500/50">
                        <span className="text-3xl">🔒</span>
                    </div>
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400 mb-2">
                        BANKER DEL DÍA
                    </h3>
                    <p className="text-sm text-gray-300 mb-6 max-w-[250px] leading-relaxed">
                        Esta es la predicción más segura del sistema. <br />
                        <span className="text-orange-300 font-bold">Exclusivo Premium o Desbloqueo.</span>
                    </p>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onUnlock?.(match.id);
                        }}
                        className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.4)] transform hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <span>🔓</span> Desbloquear Banker
                    </button>
                    <p className="mt-4 text-[10px] text-gray-500 uppercase tracking-widest">
                        Consume 1 desbloqueo diario
                    </p>
                </div>
            )}

            {/* Fire Border Animation */}
            <div className={`absolute inset-0 border-2 rounded-3xl transition-all duration-500 ${isHot ? 'border-orange-400 shadow-[0_0_30px_rgba(251,146,60,0.5)]'
                : 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)]'
                }`} />

            {/* Content (Blurred if locked) */}
            <div className={`relative z-10 p-6 ${isLocked ? 'blur-md opacity-20 pointer-events-none' : ''}`}>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-3xl animate-bounce">🔥</span>
                        <div>
                            <h3 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">
                                BANKER DEL DÍA
                            </h3>
                            <p className="text-xs text-orange-300/80">La apuesta más segura</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
                            {confidence}%
                        </div>
                        <div className="text-xs text-gray-400">Confianza</div>
                    </div>
                </div>

                {/* Match Info */}
                <div className="bg-black/40 rounded-xl p-4 mb-4 border border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{match.sportIcon}</span>
                            <div>
                                <p className="font-bold text-white text-lg">
                                    {match.home?.name} vs {match.away?.name}
                                </p>
                                <p className="text-sm text-gray-400">{match.league}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-bold text-orange-400">{countdown}</div>
                            <p className="text-xs text-gray-500">{match.startTime}</p>
                        </div>
                    </div>
                </div>

                {/* Prediction */}
                <div className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-xl p-4 border border-green-500/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-4xl">🎯</span>
                            <div>
                                <p className="text-sm text-gray-400">Predicción</p>
                                <p className="text-xl font-bold text-white">
                                    {match.prediction?.text || 'Análisis en curso...'}
                                </p>
                            </div>
                        </div>
                        <button className="btn-primary bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black font-bold">
                            Ver Análisis
                        </button>
                    </div>
                </div>

                {/* Win Streak (if available) */}
                <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                    <span className="text-green-400">✅ Racha actual:</span>
                    <span className="font-bold text-white">{streak} aciertos consecutivos</span>
                    <span className="text-gray-500">|</span>
                    <span className="text-gray-400">Historial: {accuracy}% precisión</span>
                </div>
            </div>

            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-16 h-16 border-l-4 border-t-4 border-orange-400/50 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-r-4 border-b-4 border-yellow-400/50 rounded-br-2xl" />
        </div>
    );
}
