'use client';
import { getLogoWithFallback } from '@/lib/team-logos';

export default function MiniPredictionCard({ match, onRemove }) {
    // Logos
    const homeLogo = match.home?.logo || getLogoWithFallback(match.home?.name, match.sport);
    const awayLogo = match.away?.logo || getLogoWithFallback(match.away?.name, match.sport);

    // Prediction Logic
    const winnerKey = match.prediction?.winner;
    let winnerName = 'EMPATE';

    // Safely access names
    const homeName = match.home?.name || 'Local';
    const awayName = match.away?.name || 'Visita';

    if (winnerKey === 'home') winnerName = homeName;
    else if (winnerKey === 'away') winnerName = awayName;

    // Truncate logic
    const displayName = winnerName.length > 18 ? winnerName.substring(0, 16) + '...' : winnerName;

    const confidence = match.prediction?.confidence || 'silver';
    const confidenceColor =
        confidence === 'diamond' ? 'text-cyan-400' :
            confidence === 'gold' ? 'text-yellow-400' : 'text-gray-400';

    return (
        <div className="relative bg-[#151725] border border-white/5 rounded-xl p-3 flex flex-col gap-2 group hover:border-white/20 transition-all">
            {/* Remove Button */}
            <button
                onClick={(e) => { e.stopPropagation(); onRemove(match.id); }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                ✕
            </button>

            {/* Header */}
            <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-wider">
                <span className="truncate max-w-[100px]">{match.league}</span>
                <span>{match.startTime}</span>
            </div>

            {/* Teams */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                    <img src={homeLogo} className="w-6 h-6 object-contain" onError={(e) => e.target.style.display = 'none'} />
                    <span className="text-white font-bold text-xs truncate max-w-[80px] leading-tight">{homeName}</span>
                </div>
                <div className="text-[10px] text-gray-600 font-black px-2">VS</div>
                <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="text-white font-bold text-xs truncate max-w-[80px] text-right leading-tight">{awayName}</span>
                    <img src={awayLogo} className="w-6 h-6 object-contain" onError={(e) => e.target.style.display = 'none'} />
                </div>
            </div>

            {/* Footer */}
            <div className="mt-1 pt-2 border-t border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="text-lg">🤖</span>
                    <div className="flex flex-col leading-none overflow-hidden">
                        <span className="text-[9px] text-gray-500 uppercase">Predicción</span>
                        <div className="flex items-center gap-1">
                            <span className={`text-xs font-bold ${confidenceColor} uppercase truncate`}>
                                GANA {displayName}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="px-2 py-1 rounded bg-white/5 text-center min-w-[40px] shrink-0 border border-white/5">
                    <span className="text-xs font-mono font-bold text-white tracking-tighter">
                        {match.prediction?.winner === 'home' ? (match.odds?.home || '1.00') :
                            match.prediction?.winner === 'away' ? (match.odds?.away || '1.00') : (match.odds?.draw || '1.00')}
                    </span>
                </div>

            </div>
        </div>
    );
}
