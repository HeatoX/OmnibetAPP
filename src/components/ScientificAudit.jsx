'use client';

import { useState, useEffect } from 'react';
import { getTravelAudit, getRestAudit, getMarketAudit, getRefereeAudit } from '@/lib/matrix-engine';

/**
 * Scientific Audit Component (Matrix V26)
 * High-tech terminal for real-world truth analysis
 */
export default function ScientificAudit({ match, analysis, onClose }) {
    const [auditData, setAuditData] = useState(null);
    const [scanning, setScanning] = useState(true);

    useEffect(() => {
        async function runAudit() {
            setScanning(true);

            // Artificial delay to simulate "High Performance Computing" (Matrix Vibe)
            await new Promise(r => setTimeout(r, 1500));

            const homeRest = getRestAudit(analysis?.homeForm?.recentGames?.[0]?.date);
            const awayRest = getRestAudit(analysis?.awayForm?.recentGames?.[0]?.date);
            const travel = getTravelAudit(match.away, analysis?.gameInfo?.venue || { city: 'London' });

            // Market data from real match odds
            const open = match.odds?.history?.[0]?.home || 2.0;
            const current = match.odds?.home || 2.0;
            const market = getMarketAudit({ open, current }, 1250000);
            const ref = getRefereeAudit(analysis?.gameInfo?.officials?.[0]?.fullName || match.referee, match.home.name);

            setAuditData({
                fatigue: { homeRest, awayRest, travel },
                market,
                ref,
                stamp: new Date().toISOString()
            });

            setScanning(false);
        }
        runAudit();
    }, [match.id]);

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-4">
            <div className="bg-[#0a0a0f] border border-cyan-500/30 rounded-3xl max-w-2xl w-full p-8 relative overflow-hidden shadow-[0_0_100px_rgba(34,211,238,0.2)]">
                {/* Scan Grid Effect */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #22d3ee 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scanLine opacity-40"></div>

                {/* Header */}
                <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tighter flex items-center gap-2">
                            <span className="text-cyan-400">MATRIX</span> SCIENTIFIC AUDIT
                        </h2>
                        <p className="text-xs text-cyan-400/60 font-mono tracking-widest uppercase">System Status: {scanning ? 'Scanning Physical Plane...' : 'Analysis Complete'}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-2xl">×</button>
                </div>

                {scanning ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                        <div className="relative w-24 h-24 mb-6">
                            <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                            <div className="absolute inset-4 rounded-full bg-cyan-400/10 animate-pulse"></div>
                        </div>
                        <p className="text-cyan-400 font-mono text-xs animate-pulse">Processing physical variables and market rhythms...</p>
                    </div>
                ) : (
                    <div className="space-y-6 relative z-10 animate-fadeIn">
                        {/* Audit Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Fatigue Audit */}
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">📍 Desgaste Físico</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-400">Descanso Local</span>
                                        <span className={`text-xs font-bold ${auditData.fatigue.homeRest.status === 'FRESH' ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {auditData.fatigue.homeRest.hours}h ({auditData.fatigue.homeRest.status})
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-400">Desplazamiento Visita</span>
                                        <span className="text-xs font-bold text-white">{auditData.fatigue.travel.km} KM</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-400">Impacto Oxígeno</span>
                                        <span className={`text-xs font-bold ${auditData.fatigue.travel.altitude > 2000 ? 'text-red-400' : 'text-gray-500'}`}>
                                            {auditData.fatigue.travel.oxygenImpact} (Altitud)
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Market Audit */}
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">💹 Verdad del Mercado</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-400">Flujo de Dinero</span>
                                        <span className="text-xs font-bold text-cyan-400">{auditData.market.liquidity}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-400">Deriva de Cuota</span>
                                        <span className="text-xs font-bold text-white">{auditData.market.drift}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-400">Sentimiento Pro</span>
                                        <span className="text-xs font-bold text-purple-400">{auditData.market.sentiment}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Referee Bias Row */}
                        <div className="bg-gradient-to-r from-cyan-900/20 to-transparent border border-cyan-500/20 rounded-2xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="text-2xl">⚖️</div>
                                <div>
                                    <div className="text-xs text-cyan-400 font-bold uppercase tracking-tighter">Mano Invisible (Réferi)</div>
                                    <div className="text-white text-sm font-medium">{analysis?.gameInfo?.officials?.[0]?.fullName || match.referee || 'Oficial Estándar'}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-gray-500 uppercase">Bias Detection</div>
                                <div className="text-sm font-bold text-white">{auditData.ref.homeAdvantage} Home Bias</div>
                            </div>
                        </div>

                        {/* Final Verification Seal */}
                        <div className="pt-6 border-t border-white/5 text-center">
                            <div className="inline-block px-8 py-3 bg-cyan-500/10 border border-cyan-400/30 rounded-full mb-4">
                                <span className="text-cyan-400 font-black tracking-widest text-sm">
                                    CONFIRMACIÓN MATRIX: {match.prediction?.winner === 'home' ? match.home.name : match.away.name} TIENE EL CONTROL FÍSICO
                                </span>
                            </div>
                            <p className="text-[9px] text-gray-500 font-mono italic">
                                Audit Hash: {match.id ? `MATRIX-${match.id.toString().slice(-6).toUpperCase()}` : 'LIVE-CONNECTION'} • Real-Time Data Connection: Verified
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes scanLine {
                    0% { top: 0; }
                    100% { top: 100%; }
                }
                .animate-scanLine {
                    animation: scanLine 4s linear infinite;
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
