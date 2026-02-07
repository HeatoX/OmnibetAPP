'use client';

import { useEffect, useState } from 'react';

/**
 * Omega Indicator Component (V27)
 * The "Holy Grail" manifestation. Displays only for Ω > 90.
 */
export default function OmegaIndicator({ omegaData }) {
    if (!omegaData || omegaData.score < 90) return null;

    return (
        <div className="relative overflow-hidden bg-[#050508] border-2 border-amber-500/50 rounded-2xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.3)] animate-omegaGlow mb-8">
            {/* Visual Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-transparent pointer-events-none"></div>
            <div className="absolute top-0 right-0 p-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse"></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(245,158,11,0.5)] transform rotate-45 group">
                        <span className="transform -rotate-45 animate-pulse">Ω</span>
                    </div>
                    <div>
                        <h3 className="text-amber-400 font-black text-2xl tracking-tighter uppercase italic">Protocolo Omega Activo</h3>
                        <p className="text-white/60 text-xs font-mono uppercase tracking-[0.2em]">Singularidad Detectada - El Santo Grial</p>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    {/* Trinity Status */}
                    <div className="flex gap-3">
                        {['ORACLE', 'MATRIX', 'MARKET'].map((layer) => (
                            <div key={layer} className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                <span className="text-[10px] font-bold text-amber-200">{layer}</span>
                            </div>
                        ))}
                    </div>

                    {/* Final Score */}
                    <div className="text-right">
                        <div className="text-amber-500 text-[10px] font-bold tracking-widest uppercase">Certeza Absoluta</div>
                        <div className="text-6xl font-black text-white leading-none tracking-tighter">
                            {omegaData.score}<span className="text-2xl text-amber-500">%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Alert Hash */}
            <div className="mt-4 pt-4 border-t border-amber-500/20 flex justify-between items-center text-[9px] font-mono text-amber-500/50 uppercase tracking-widest">
                <span>Convergencia de las Tres Verdades Confirmada</span>
                <span>Hash: {omegaData.hash}</span>
            </div>

            <style jsx>{`
                @keyframes omegaGlow {
                    0% { box-shadow: 0 0 50px rgba(245,158,11,0.2); }
                    50% { box-shadow: 0 0 80px rgba(245,158,11,0.4); }
                    100% { box-shadow: 0 0 50px rgba(245,158,11,0.2); }
                }
                .animate-omegaGlow {
                    animation: omegaGlow 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
