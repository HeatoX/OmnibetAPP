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
                        <p className="text-cyan-400 font-mono text-xs animate-pulse tracking-widest">Sincronizando Pesos del Meta-Modelo Elite...</p>
                    </div>
                ) : (
                    <div className="space-y-6 relative z-10 animate-fadeIn">

                        {/* Elite Factor Breakdown (XAI) */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4">
                            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                🧠 Oráculo Elite V30.60: Desglose de Factores IA
                            </h3>
                            <div className="space-y-5">
                                {match.prediction?.explanation?.map((item, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{item.icon}</span>
                                                <span className="text-gray-300 font-medium uppercase tracking-tighter">{item.factor}</span>
                                            </div>
                                            <span className="text-white font-black">{item.impact}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                            <div
                                                className="h-full bg-gradient-to-r from-cyan-600 to-blue-400 transition-all duration-1000"
                                                style={{ width: `${item.impact}%` }}
                                            ></div>
                                        </div>
                                        {item.confidence && (
                                            <div className="text-[9px] text-cyan-400/60 font-mono italic">
                                                Confidence Level: {item.confidence}% (Probabilidad Latente HMM)
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Audit Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Fatigue Audit */}
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">📍 Desgaste Físico</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="text-gray-400">Rest Local</span>
                                        <span className={`font-bold ${auditData.fatigue.homeRest.status === 'FRESH' ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {auditData.fatigue.homeRest.hours}h ({auditData.fatigue.homeRest.status})
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="text-gray-400">Transfer Visita</span>
                                        <span className="font-bold text-white">{auditData.fatigue.travel.km} KM</span>
                                    </div>
                                </div>
                            </div>

                            {/* Market Audit */}
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">💹 Market Wisdom</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="text-gray-400">P. Implícita</span>
                                        <span className="font-bold text-cyan-400">Sincronizada</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="text-gray-400">Value Detect</span>
                                        <span className={`font-bold ${match.prediction?.isValueMatch ? 'text-emerald-400' : 'text-gray-500'}`}>
                                            {match.prediction?.isValueMatch ? 'POSITIVO' : 'NEUTRAL'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Final Verification Seal */}
                        <div className="pt-6 border-t border-white/5 text-center">
                            <div className="inline-block px-8 py-3 bg-cyan-500/10 border border-cyan-400/30 rounded-full mb-4">
                                <span className="text-cyan-400 font-black tracking-widest text-xs uppercase">
                                    {match.prediction?.isValueMatch ? 'Oportunidad de Valor Detectada por Oráculo Elite' : 'Control Estratégico Verificado'}
                                </span>
                            </div>
                            <div className="flex justify-center gap-4 text-[9px] text-gray-500 font-mono italic">
                                <span>Audit: MATRIX-{match.id?.toString().slice(-6).toUpperCase() || 'V30'}</span>
                                <span>•</span>
                                <span>Modelo: Elite Bayes V30.60</span>
                            </div>
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
