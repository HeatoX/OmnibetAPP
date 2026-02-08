'use client';

import { useState, useEffect } from 'react';
import { getLogoWithFallback, getTennisPlayer } from '@/lib/team-logos';
import { useSelection } from '@/context/SelectionContext';
import { useAlerts } from '@/components/AlertContext';
import ValueBetBadge from '@/components/ValueBetBadge';

/**
 * Premium Prediction Card Component
 * Ultra-futuristic design with real team logos
 */
export default function PredictionCard({ match, onClick, onDetailedAnalysis, userTier = 'free', isUnlocked = false, onUnlock }) {
    const [isAnimated, setIsAnimated] = useState(false);
    const [homeLogoError, setHomeLogoError] = useState(false);
    const [awayLogoError, setAwayLogoError] = useState(false);
    const { addMatch, isSelected, removeMatch } = useSelection();
    const { addAlert } = useAlerts();

    useEffect(() => {
        setIsAnimated(true);
    }, []);

    const handleSelection = (e) => {
        e.stopPropagation();
        if (isSelected(match.id)) {
            removeMatch(match.id);
            addAlert({ type: 'info', title: 'Sala Privada', message: 'Partido eliminado de tu sala.', match: match.home.name + ' vs ' + match.away.name });
        } else {
            addMatch(match);
            addAlert({ type: 'success', title: 'Sala Privada', message: 'Partido agregado correctamente.', match: match.home.name + ' vs ' + match.away.name });
        }
    };

    const inBetslip = isSelected(match.id);

    const confidenceStyles = {
        diamond: {
            badge: 'badge-diamond',
            glow: 'glow-blue',
            label: '💎 DIAMANTE',
            accent: '#00d4ff',
        },
        gold: {
            badge: 'badge-gold',
            glow: 'glow-gold',
            label: '🥇 ORO',
            accent: '#ffd700',
        },
        silver: {
            badge: 'badge-silver',
            glow: '',
            label: '🥈 PLATA',
            accent: '#c0c0c0',
        },
    };

    const style = confidenceStyles[match.prediction?.confidence] || confidenceStyles.silver;
    const maxProb = Math.max(
        match.prediction?.homeWinProb || 0,
        match.prediction?.awayWinProb || 0,
        match.prediction?.drawProb || 0
    );

    const isSupreme = match.prediction?.supremeVerdict?.status === 'SUPREME_ACTIVE';

    // PRIORITY: 1) ESPN logo from API, 2) Local database, 3) Emoji fallback
    const homeLogo = match.home?.logo || getLogoWithFallback(match.home?.name, match.sport);
    const awayLogo = match.away?.logo || getLogoWithFallback(match.away?.name, match.sport);

    // Tennis-specific info
    const isTennis = match.sport === 'tennis';
    const homePlayer = isTennis ? getTennisPlayer(match.home?.name) : null;
    const awayPlayer = isTennis ? getTennisPlayer(match.away?.name) : null;

    return (
        <div
            className={`match-card cursor-pointer ${style.glow} ${isAnimated ? 'animate-fadeIn' : 'opacity-0'} relative group`}
            data-sport={match.sport}
            onClick={() => onClick?.(match)}
        >
            {/* ADD TO PRIVATE ROOM BUTTON */}
            {/* ADD TO PRIVATE ROOM BUTTON (Moved to Left to avoid Badge overlap) */}
            <button
                onClick={handleSelection}
                className={`absolute top-3 left-3 z-50 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-lg border border-white/10 ${inBetslip ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.6)]' : 'bg-black/40 text-gray-400 hover:bg-cyan-500/20 hover:text-cyan-400 backdrop-blur-sm'}`}
                title={inBetslip ? "Quitar de Sala Privada" : "Agregar a Sala Privada"}
            >
                {inBetslip ? '✓' : '+'}
            </button>

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <span className="text-3xl drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 10px currentColor)' }}>
                        {match.sportIcon}
                    </span>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-300 tracking-wide uppercase">
                                {match.league}
                            </span>
                            {isSupreme && (
                                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-[9px] font-black text-white px-2 py-0.5 rounded-full shadow-[0_0_10px_#a855f7] animate-pulse whitespace-nowrap">
                                    🌌 SUPREMO
                                </span>
                            )}
                        </div>
                        {isTennis && homePlayer?.ranking && (
                            <span className="ml-2 text-xs text-gray-500">
                                #{homePlayer.ranking} vs #{awayPlayer?.ranking}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {match.prediction?.isValueMatch && (
                        <span className="bg-gradient-to-r from-emerald-500 to-teal-400 text-[10px] font-black text-black px-2 py-0.5 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-bounce whitespace-nowrap">
                            🔥 VALOR ELITE
                        </span>
                    )}
                    <span className={style.badge}>{style.label}</span>
                </div>
            </div>

            {/* Teams with Real Logos */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mb-5">
                {/* Home Team/Player */}
                <div className="flex flex-col items-center text-center">
                    <div className="team-logo team-logo-lg mb-3 relative">
                        {!homeLogoError ? (
                            <img
                                src={homeLogo}
                                alt={match.home?.name}
                                className="w-full h-full object-contain drop-shadow-md"
                                onError={() => setHomeLogoError(true)}
                            />
                        ) : (
                            <span className="text-4xl grayscale opacity-50">
                                {isTennis ? '👤' : match.home?.logo}
                            </span>
                        )}
                    </div>
                    <div className="font-bold text-white text-lg leading-tight tracking-wide break-words max-w-[120px]">
                        {match.home?.name}
                    </div>
                    {isTennis && <div className="text-xs text-gray-500 uppercase mt-1">{match.home?.country}</div>}
                    {match.isLive && (
                        <div className="score-display mt-2">{match.home?.score}</div>
                    )}
                    {/* Sentinel Sentiment Badge */}
                    {match.prediction?.sentinelReport?.home?.sentiment === 'positive' && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-green-400 font-bold bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20 animate-pulse">
                            🚀 IMPULSO SENTINEL
                        </div>
                    )}
                    {match.prediction?.sentinelReport?.home?.sentiment === 'negative' && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-red-400 font-bold bg-red-400/10 px-2 py-0.5 rounded-full border border-red-400/20">
                            ⚠️ RIESGO DETECTADO
                        </div>
                    )}
                </div>

                {/* VS / Time / Date */}
                <div className="flex flex-col items-center justify-center">
                    {match.isLive ? (
                        <div className="flex flex-col items-center">
                            <div className="score-vs text-2xl font-black italic text-gray-700/50">VS</div>
                            <div className="live-minute-badge mt-1 px-2 py-0.5 bg-red-500/20 text-red-500 text-[10px] font-bold rounded-full animate-pulse border border-red-500/30">
                                {match.liveMinute || 'LIVE'}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                                {match.relativeDate || 'Próximo'}
                            </div>
                            <div className="text-white font-mono text-xl font-bold bg-white/5 px-2 py-1 rounded">
                                {match.startTime}
                            </div>
                        </div>
                    )}
                </div>

                {/* Away Team/Player */}
                <div className="flex flex-col items-center text-center">
                    <div className="team-logo team-logo-lg mb-3 relative">
                        {!awayLogoError ? (
                            <img
                                src={awayLogo}
                                alt={match.away?.name}
                                className="w-full h-full object-contain drop-shadow-md"
                                onError={() => setAwayLogoError(true)}
                            />
                        ) : (
                            <span className="text-4xl grayscale opacity-50">
                                {isTennis ? '👤' : match.away?.logo}
                            </span>
                        )}
                    </div>
                    <div className="font-bold text-white text-lg leading-tight tracking-wide break-words max-w-[120px]">
                        {match.away?.name}
                    </div>
                    {isTennis && <div className="text-xs text-gray-500 uppercase mt-1">{match.away?.country}</div>}
                    {match.isLive && (
                        <div className="score-display mt-2">{match.away?.score}</div>
                    )}
                    {/* Sentinel Sentiment Badge */}
                    {match.prediction?.sentinelReport?.away?.sentiment === 'positive' && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-green-400 font-bold bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20 animate-pulse">
                            🚀 IMPULSO SENTINEL
                        </div>
                    )}
                    {match.prediction?.sentinelReport?.away?.sentiment === 'negative' && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-red-400 font-bold bg-red-400/10 px-2 py-0.5 rounded-full border border-red-400/20">
                            ⚠️ RIESGO DETECTADO
                        </div>
                    )}
                </div>
            </div>

            {/* AI Prediction Section (LOCKED LOGIC) */}
            <div className={`relative bg-gradient-to-br from-black/40 to-black/20 rounded-2xl p-5 mb-5 border border-white/5 overflow-hidden group/card`}>

                {/* --- SMART LOCK LAYERS --- */}

                {/* 1. RESTRICTED LOCK (Free users NOT in trial) */}
                {userTier === 'free' && !isUnlocked && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-20 flex flex-col items-center justify-center p-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3 border border-white/10">
                            <span className="text-2xl">🔒</span>
                        </div>
                        <h3 className="text-white font-bold mb-1">Predicción Bloqueada</h3>
                        <p className="text-xs text-gray-400 mb-3 max-w-[200px]">
                            Desbloquea para ver el ganador y porcentajes.
                        </p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onUnlock?.(match.id);
                            }}
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-xs font-bold py-2 px-4 rounded-full transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/20"
                        >
                            🔓 Desbloquear (3 restantes)
                        </button>
                    </div>
                )}

                {/* 2. DIAMOND EXCLUSIVE LOCK (Gold users) - Doesn't show for Admins/Diamond */}
                {userTier === 'gold' && match.isDiamondPick && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-20 flex flex-col items-center justify-center p-4 text-center border-2 border-[#00d4ff]/30">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00d4ff]/20 to-blue-900/40 flex items-center justify-center mb-3 animate-pulse">
                            <span className="text-2xl">💎</span>
                        </div>
                        <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-white font-bold mb-1">
                            Solo Miembros Diamond
                        </h3>
                        <p className="text-xs text-gray-400 mb-3 max-w-[200px]">
                            Esta es una de las 4 predicciones exclusivas del día.
                        </p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                // This usually triggers upgrade modal in page.jsx via prop if passed, 
                                // but for now let's just make it clear it's a lock only for true Gold users
                            }}
                            className="border border-[#00d4ff] text-[#00d4ff] hover:bg-[#00d4ff] hover:text-black text-xs font-bold py-2 px-4 rounded-full transition-all"
                        >
                            🚀 Actualizar a Diamond
                        </button>
                    </div>
                )}


                {/* --- CONTENT (Blurred if locked) --- */}
                <div className={(userTier === 'free' && !isUnlocked) || (userTier === 'gold' && match.isDiamondPick) ? 'blur-sm opacity-50 pointer-events-none' : ''}>

                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="relative">
                            <span className="text-xl">🤖</span>
                            {match.prediction?.oracleV12?.hasPattern && (
                                <span
                                    className="absolute -top-1 -right-1 text-[10px] animate-pulse drop-shadow-[0_0_5px_#00d4ff]"
                                    title="V12: Patrón Detectado"
                                >
                                    👁️
                                </span>
                            )}
                        </div>
                        <span className="text-gradient font-bold text-xl tracking-wide uppercase">
                            {match.prediction?.winner === 'home' ? `GANA ${match.home.name}` :
                                match.prediction?.winner === 'away' ? `GANA ${match.away.name}` :
                                    (match.prediction?.text || 'EMPATAR')}
                        </span>
                    </div>

                    {/* Value Bet Detector Layer */}
                    <div className="flex justify-center mb-4">
                        <ValueBetBadge
                            probability={maxProb}
                            odds={match.prediction?.winner === 'home' ? match.odds?.home :
                                match.prediction?.winner === 'away' ? match.odds?.away :
                                    match.odds?.draw}
                        />
                    </div>


                    {/* Probability Bars */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-400 w-8 font-bold tracking-wider">1</span>
                            <div className="probability-bar flex-1">
                                <div
                                    className="probability-fill"
                                    style={{
                                        width: `${match.prediction?.homeWinProb || 0}%`,
                                        background: match.prediction?.homeWinProb === maxProb
                                            ? 'linear-gradient(90deg, #00ff9d, #00d4ff)'
                                            : 'rgba(255,255,255,0.15)'
                                    }}
                                ></div>
                            </div>
                            <span className={`text-sm font-bold w-12 text-right ${match.prediction?.homeWinProb === maxProb ? 'text-gradient' : 'text-gray-400'
                                }`}>
                                {match.prediction?.homeWinProb}%
                            </span>
                        </div>

                        {match.prediction?.drawProb > 0 && (
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-400 w-8 font-bold tracking-wider">X</span>
                                <div className="probability-bar flex-1">
                                    <div
                                        className="probability-fill"
                                        style={{
                                            width: `${match.prediction?.drawProb}%`,
                                            background: 'rgba(255,255,255,0.1)'
                                        }}
                                    ></div>
                                </div>
                                <span className="text-sm font-bold w-12 text-right text-gray-400">
                                    {match.prediction?.drawProb}%
                                </span>
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-400 w-8 font-bold tracking-wider">2</span>
                            <div className="probability-bar flex-1">
                                <div
                                    className="probability-fill"
                                    style={{
                                        width: `${match.prediction?.awayWinProb || 0}%`,
                                        background: match.prediction?.awayWinProb === maxProb
                                            ? 'linear-gradient(90deg, #00ff9d, #00d4ff)'
                                            : 'rgba(255,255,255,0.15)'
                                    }}
                                ></div>
                            </div>
                            <span className={`text-sm font-bold w-12 text-right ${match.prediction?.awayWinProb === maxProb ? 'text-gradient' : 'text-gray-400'
                                }`}>
                                {match.prediction?.awayWinProb}%
                            </span>
                        </div>
                    </div>

                </div>
            </div>

            {/* Player Predictions (Sport-Specific) */}
            {match.playerPredictions?.length > 0 && (
                <div className="mb-5">
                    <div className="text-xs text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span>⚡</span> Predicciones de Jugadores
                    </div>
                    <div className="space-y-2">
                        {match.playerPredictions.slice(0, 2).map((pred, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{pred.icon || '👤'}</span>
                                    <span className="text-sm text-gray-300">{pred.player}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">{pred.prediction}</span>
                                    <span className="text-xs font-bold px-2 py-1 rounded bg-[var(--neon-green)]/20 text-[var(--neon-green)]">
                                        {pred.probability}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Odds & CTA */}
            <div className="flex items-center justify-between">
                <div className="flex gap-4">
                    <div className="odds-chip">
                        <span className="text-xs text-gray-500 mr-1">1</span>
                        <span className="text-white">{match.odds?.home}</span>
                    </div>
                    {match.odds?.draw && (
                        <div className="odds-chip">
                            <span className="text-xs text-gray-500 mr-1">X</span>
                            <span className="text-white">{match.odds?.draw}</span>
                        </div>
                    )}
                    <div className="odds-chip">
                        <span className="text-xs text-gray-500 mr-1">2</span>
                        <span className="text-white">{match.odds?.away}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {onDetailedAnalysis && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDetailedAnalysis?.(match);
                            }}
                            className="text-cyan-400 hover:text-white transition-colors text-xs font-bold 
                                       flex items-center gap-1 bg-cyan-500/10 px-2 py-1 rounded-lg"
                        >
                            📊 Stats
                            <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1 rounded">PRO</span>
                        </button>
                    )}
                    <button className="text-[var(--neon-green)] hover:text-white transition-colors text-sm font-bold tracking-wide uppercase flex items-center gap-1">
                        Ver análisis
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
