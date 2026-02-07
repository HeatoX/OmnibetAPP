'use client';

import { useState, useEffect } from 'react';
import { calculateStats, getRecentPredictions } from '@/lib/history-tracker';
import Header from '@/components/Header';
import TransparencyStats from '@/components/TransparencyStats';

export default function TransparencyPage() {
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [statsData, historyData] = await Promise.all([
                    calculateStats('all'),
                    getRecentPredictions(50)
                ]);
                setStats(statsData);
                setHistory(historyData);
            } catch (error) {
                console.error("Error loading transparency data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <Header />

            <main className="max-w-7xl mx-auto px-4 py-12 pb-24">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-400 to-blue-500">
                        AUDITORÍA DE PRECISIÓN AI
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Transparencia total. Todos los resultados del Oráculo son verificados con datos oficiales de ESPN y registrados de forma inmutable.
                    </p>
                </div>

                {/* Stats Summary Component */}
                {stats && <TransparencyStats stats={stats} />}

                {/* Detailed History Table */}
                <div className="mt-16 bg-white/5 rounded-3xl border border-white/10 overflow-hidden backdrop-blur-xl">
                    <div className="p-8 border-b border-white/10 flex justify-between items-center">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <span className="text-cyan-400">📊</span> Historial de Operaciones
                        </h2>
                        <span className="text-xs text-gray-500 uppercase tracking-widest">Últimos 50 Partidos</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-black/40 text-xs font-bold uppercase tracking-widest text-gray-500">
                                <tr>
                                    <th className="px-8 py-4">Fecha</th>
                                    <th className="px-8 py-4">Evento</th>
                                    <th className="px-8 py-4">Predicción Oráculo</th>
                                    <th className="px-8 py-4">Resultado Real</th>
                                    <th className="px-8 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {history.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-8 py-6 text-sm text-gray-400 font-mono">
                                            {new Date(item.start_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                                                    {item.home_team} vs {item.away_team}
                                                </span>
                                                <span className="text-[10px] text-gray-500 uppercase mt-1">{item.league}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-bold px-2 py-1 rounded ${item.confidence >= 75 ? 'bg-cyan-500/10 text-cyan-400' : 'bg-gray-500/10 text-gray-400'
                                                    }`}>
                                                    {item.predicted_winner === 'home' ? 'Gana Local' :
                                                        item.predicted_winner === 'away' ? 'Gana Visita' : 'Empate'}
                                                </span>
                                                <span className="text-xs text-gray-500">{item.confidence}%</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-mono text-gray-300">
                                            {item.final_score ? `${item.final_score.home} - ${item.final_score.away}` : 'TBD'}
                                        </td>
                                        <td className="px-8 py-6">
                                            {item.status === 'won' ? (
                                                <span className="flex items-center gap-1 text-emerald-400 font-black text-xs">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                                    ACIERTADO
                                                </span>
                                            ) : item.status === 'lost' ? (
                                                <span className="text-red-400/50 font-bold text-xs uppercase tracking-tighter">
                                                    Fallado
                                                </span>
                                            ) : (
                                                <span className="text-gray-600 italic text-xs uppercase">Pendiente</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
