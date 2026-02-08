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
            const open = match.odds?.history?.[0]?.home ?? null;
            const current = match.odds?.home ?? null;
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
                                🧠 Oráculo Observer V50.0: Desglose de Factores IA
                            </h3>
                            <div className="space-y-5">
                                {Object.entries(match.prediction?.weights || {}).map(([key, weight], idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-300 font-medium uppercase tracking-tighter">{key}</span>
                                            </div>
                                            <span className="text-white font-black">{Math.round(weight * 100)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                            <div
                                                className="h-full bg-gradient-to-r from-cyan-600 to-blue-400 transition-all duration-1000"
                                                style={{ width: `${weight * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sentinel: Market Anticipation (V50) */}
                        <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-cyan-500/30 rounded-2xl p-6 mb-4 relative overflow-hidden">
                            <div className="absolute top-2 right-2 px-2 py-0.5 bg-cyan-500 text-[8px] font-bold text-black rounded uppercase animate-pulse">Sentinel Active</div>
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                👁️ Anticipación de Mercado (Drift)
                            </h3>
                            <div className="flex items-center justify-between gap-6">
                                <div className="flex-1">
                                    <div className={`text-lg font-black ${match.prediction?.sentinel?.advice === 'BET_NOW' ? 'text-green-400' : match.prediction?.sentinel?.advice === 'WAIT' ? 'text-amber-400' : 'text-gray-300'}`}>
                                        {match.prediction?.sentinel?.advice === 'BET_NOW' ? 'CORRECCIÓN INMINENTE' : match.prediction?.sentinel?.advice === 'WAIT' ? 'VALOR EN ASCENSO' : 'MERCADO ESTABLE'}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">{match.prediction?.sentinel?.message}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-mono text-cyan-400">FIABILIDAD</div>
                                    <div className="text-2xl font-black text-white">{match.prediction?.sentinel?.confidence}%</div>
                                </div>
                            </div>
                        </div>

                        {/* Narrative Layer (V50) */}
                        {match.prediction?.narrative?.factors?.length > 0 && (
                            <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-2xl p-6 mb-4">
                                <h3 className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    🎭 Capa Narrativa (Grudge & Glory)
                                </h3>
                                <div className="space-y-3">
                                    {match.prediction.narrative.factors.map((f, i) => (
                                        <div key={i} className="flex items-center gap-3 p-2 bg-black/20 rounded-xl border border-white/5">
                                            <span className="text-xl">{f.icon}</span>
                                            <div>
                                                <div className="text-[10px] font-bold text-white uppercase">{f.label}</div>
                                                <div className="text-[9px] text-gray-400">{f.detail}</div>
                                            </div>
                                            <div className="ml-auto text-[10px] font-black text-purple-400">+{Math.round(f.weight * 100)}%</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantum Layer (V40.0) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Tactical ADN & Chemistry */}
                            <div className="bg-gradient-to-br from-purple-900/20 to-transparent border border-purple-500/20 rounded-2xl p-4">
                                <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    🧬 ADN Táctico & Química
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-400 italic">ADN Local:</span>
                                        <span className="text-white font-bold">{match.prediction?.quantum?.homeADN}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-400 italic">ADN Visita:</span>
                                        <span className="text-white font-bold">{match.prediction?.quantum?.awayADN}</span>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full mt-2">
                                        <div
                                            className={`h-full transition-all duration-1000 ${match.prediction?.quantum?.isFragmented ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]'}`}
                                            style={{ width: `${(match.prediction?.quantum?.graphStability || 1) * 100}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-[9px] text-gray-500 font-mono">
                                        Estabilidad del Grafo: {Math.round((match.prediction?.quantum?.graphStability || 1) * 100)}%
                                        {match.prediction?.quantum?.isFragmented ? ' (Conexión Crítica Perdida)' : ' (Cohesión Táctica Óptima)'}
                                    </p>
                                </div>
                            </div>

                            {/* Risk Management (Kelly) */}
                            <div className="bg-gradient-to-br from-emerald-900/20 to-transparent border border-emerald-500/20 rounded-2xl p-4">
                                <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    ⚖️ Gestión de Riesgo (Kelly)
                                </h3>
                                <div className="space-y-4 text-center py-2">
                                    <div className="text-2xl font-black text-white tracking-widest">
                                        {match.prediction?.quantum?.kellyRecommendation || '0.00%'}
                                    </div>
                                    <p className="text-[10px] text-emerald-400/80 font-mono uppercase bg-emerald-500/10 py-1 rounded-lg border border-emerald-500/20">
                                        Stake Sugerido (1/4 Kelly)
                                    </p>
                                    <p className="text-[9px] text-gray-500 italic">
                                        Maximiza crecimiento geométrico del bankroll con riesgo controlado.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Audit Grid (Reduced) */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Physical Fatigue remains but smaller */}
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">📍 Desgaste Físico</h3>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-gray-400">Transfer Visita</span>
                                    <span className="font-bold text-white">{auditData.fatigue.travel.km} KM</span>
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">💹 Market Value</h3>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-gray-400">Value Detect</span>
                                    <span className={`font-bold ${match.prediction?.isValueMatch ? 'text-emerald-400' : 'text-gray-500'}`}>
                                        {match.prediction?.isValueMatch ? 'POSITIVO' : 'NEUTRAL'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Final Verification Seal */}
                        <div className="pt-6 border-t border-white/5 text-center">
                            <div className="inline-block px-8 py-3 bg-cyan-500/10 border border-cyan-400/30 rounded-full mb-4">
                                <span className="text-cyan-400 font-black tracking-widest text-xs uppercase">
                                    Soberanía Predictiva Confirmada • Oráculo Quantum V40.0
                                </span>
                            </div>
                            <div className="flex justify-center gap-4 text-[9px] text-gray-500 font-mono italic">
                                <span>Audit: MATRIX-{match.id?.toString().slice(-6).toUpperCase() || 'V40'}</span>
                                <span>•</span>
                                <span>Engine: Cognitive Graph V40.0</span>
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
