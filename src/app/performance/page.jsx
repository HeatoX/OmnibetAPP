'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PerformanceDashboard from '@/components/PerformanceDashboard';
import { generatePerformanceData, generateOverallStats } from '@/lib/mock-data';

export default function PerformancePage() {
    const [performanceData, setPerformanceData] = useState([]);
    const [overallStats, setOverallStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('week');

    useEffect(() => {
        setTimeout(() => {
            setPerformanceData(generatePerformanceData());
            setOverallStats(generateOverallStats());
            setIsLoading(false);
        }, 500);
    }, []);

    return (
        <div className="min-h-screen bg-grid">
            <div className="bg-glow"></div>
            <Header />

            <main className="relative z-10 pt-20 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Page Header */}
                    <section className="py-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h1 className="heading-lg flex items-center gap-3">
                                    <span>📊</span>
                                    Tabulador de Certeza
                                </h1>
                                <p className="text-gray-400 mt-2">
                                    Historial de predicciones verificado y transparente. Cada acierto y fallo registrado.
                                </p>
                            </div>

                            {/* Time Range Selector */}
                            <div className="flex gap-2">
                                {[
                                    { id: 'week', label: '7 días' },
                                    { id: 'month', label: '30 días' },
                                    { id: 'all', label: 'Todo' },
                                ].map((range) => (
                                    <button
                                        key={range.id}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === range.id
                                                ? 'bg-gradient-to-r from-green-400 to-cyan-400 text-black'
                                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                            }`}
                                        onClick={() => setTimeRange(range.id)}
                                    >
                                        {range.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Transparency Notice */}
                    <div className="glass-card p-4 mb-8 border-green-500/30 bg-green-500/5">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">✅</span>
                            <div>
                                <p className="text-white font-medium">Resultados 100% Verificables</p>
                                <p className="text-gray-400 text-sm">
                                    Todas las predicciones se registran ANTES del inicio del partido.
                                    No hay ediciones post-partido.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Loading */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="w-16 h-16 border-4 border-t-cyan-400 border-r-green-400 border-b-cyan-400 border-l-green-400 rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-400">Cargando estadísticas...</p>
                            </div>
                        </div>
                    )}

                    {/* Performance Dashboard */}
                    {!isLoading && (
                        <PerformanceDashboard
                            data={performanceData}
                            overallStats={overallStats}
                        />
                    )}

                    {/* Recent Predictions Log */}
                    <section className="mt-8">
                        <h2 className="heading-md mb-4 flex items-center gap-2">
                            <span>📝</span> Últimas Predicciones
                        </h2>

                        <div className="glass-card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-black/30">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm text-gray-400 font-medium">Partido</th>
                                            <th className="px-4 py-3 text-left text-sm text-gray-400 font-medium">Predicción</th>
                                            <th className="px-4 py-3 text-center text-sm text-gray-400 font-medium">Confianza</th>
                                            <th className="px-4 py-3 text-center text-sm text-gray-400 font-medium">Resultado</th>
                                            <th className="px-4 py-3 text-right text-sm text-gray-400 font-medium">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {[
                                            { match: 'Real Madrid vs Barcelona', prediction: 'Gana Madrid', confidence: 'diamond', result: '2-1', status: 'win' },
                                            { match: 'Lakers vs Celtics', prediction: 'Más de 220.5', confidence: 'gold', result: '118-112', status: 'win' },
                                            { match: 'NY Yankees vs Dodgers', prediction: 'Gana Yankees', confidence: 'silver', result: '3-5', status: 'loss' },
                                            { match: 'Chiefs vs 49ers', prediction: 'Chiefs -3.5', confidence: 'gold', result: '27-21', status: 'win' },
                                            { match: 'Alcaraz vs Sinner', prediction: 'Gana Alcaraz', confidence: 'diamond', result: '6-4, 6-3', status: 'win' },
                                            { match: 'Man City vs Liverpool', prediction: 'Ambos anotan', confidence: 'gold', result: '1-1', status: 'win' },
                                            { match: 'Bayern vs Dortmund', prediction: 'Gana Bayern', confidence: 'silver', result: '1-2', status: 'loss' },
                                            { match: 'Miami Heat vs Bucks', prediction: 'Heat +4.5', confidence: 'gold', result: '95-102', status: 'win' },
                                        ].map((pred, idx) => (
                                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3">
                                                    <span className="text-white font-medium">{pred.match}</span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-300">{pred.prediction}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`badge-${pred.confidence} text-xs`}>
                                                        {pred.confidence === 'diamond' ? '💎' : pred.confidence === 'gold' ? '🥇' : '🥈'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center font-mono text-gray-300">{pred.result}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${pred.status === 'win'
                                                            ? 'bg-green-500/20 text-green-400'
                                                            : 'bg-red-500/20 text-red-400'
                                                        }`}>
                                                        {pred.status === 'win' ? '✓ Acierto' : '✗ Fallo'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {/* Monthly Summary */}
                    <section className="mt-8">
                        <div className="glass-card p-6">
                            <h3 className="heading-md mb-4">📅 Resumen Mensual</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { month: 'Enero', accuracy: 72, predictions: 450, profit: '+18.5%' },
                                    { month: 'Diciembre', accuracy: 68, predictions: 520, profit: '+12.2%' },
                                    { month: 'Noviembre', accuracy: 71, predictions: 480, profit: '+16.8%' },
                                    { month: 'Octubre', accuracy: 69, predictions: 510, profit: '+14.1%' },
                                ].map((month, idx) => (
                                    <div key={idx} className="bg-black/30 rounded-xl p-4 text-center">
                                        <p className="text-gray-400 text-sm mb-2">{month.month}</p>
                                        <p className="text-2xl font-bold text-gradient">{month.accuracy}%</p>
                                        <p className="text-xs text-gray-500 mt-1">{month.predictions} predicciones</p>
                                        <p className="text-sm text-green-400 font-medium mt-1">{month.profit}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
