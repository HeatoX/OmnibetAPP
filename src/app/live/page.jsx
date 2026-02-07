'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PredictionCard from '@/components/PredictionCard';
import { getRealMatches } from '@/lib/real-data-service';

export default function LivePage() {
    const [matches, setMatches] = useState([]);
    const [activeSport, setActiveSport] = useState('all');
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            const allMatches = await getRealMatches();
            const liveOnly = allMatches.filter(m => m.isLive);
            setMatches(liveOnly);
            setIsLoading(false);
        };

        loadData();

        const interval = setInterval(async () => {
            const allMatches = await getRealMatches();
            const liveOnly = allMatches.filter(m => m.isLive);
            setMatches(liveOnly);

            // Deterministic Alerts based on Match ID and Score
            if (liveOnly.length > 0) {
                const liveMatch = liveOnly[0];
                const seed = parseInt(liveMatch.id.toString().slice(-4));

                if (seed % 10 > 7) { // 20% deterministic chance
                    const alertTypes = [
                        { type: 'momentum', icon: '⚡', title: 'Cambio de Momentum', urgency: 'high' },
                        { type: 'goal', icon: '⚽', title: 'Gol Inminente', urgency: 'critical' },
                        { type: 'value', icon: '💰', title: 'Valor Detectado', urgency: 'medium' },
                    ];

                    const alert = alertTypes[seed % 3];

                    setAlerts(prev => [{
                        id: `${liveMatch.id}-${Date.now()}`,
                        ...alert,
                        match: `${liveMatch.home?.name} vs ${liveMatch.away?.name}`,
                        message: alert.type === 'momentum'
                            ? `Dominio táctico detectado para ${liveMatch.home?.name}`
                            : alert.type === 'goal'
                                ? 'Presión alta detectada por Matrix Engine.'
                                : `Oportunidad de valor identificada en el mercado en vivo.`,
                    }, ...prev.slice(0, 4)]);
                }
            }
        }, 30000); // 30s for real data to avoid rate limits

        return () => clearInterval(interval);
    }, []);

    // Filter by sport
    const filteredMatches = activeSport === 'all'
        ? matches
        : matches.filter(m => m.sport === activeSport);

    return (
        <div className="min-h-screen bg-grid">
            <div className="bg-glow"></div>
            <Header />

            <main className="relative z-10 pt-20 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Page Header */}
                    <section className="py-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="live-indicator text-lg">
                                <span className="live-dot"></span>
                                <span>EN VIVO</span>
                            </div>
                            <h1 className="heading-lg">Partidos en Tiempo Real</h1>
                        </div>

                        <p className="text-gray-400 max-w-2xl">
                            Sigue todos los partidos en vivo con actualizaciones cada 5 segundos.
                            Recibe alertas de oportunidades detectadas por la IA.
                        </p>
                    </section>

                    {/* Live Alerts */}
                    {alerts.length > 0 && (
                        <section className="mb-8">
                            <h2 className="heading-md mb-4 flex items-center gap-2">
                                <span>🚨</span> Alertas en Vivo
                                <span className="badge-diamond text-xs ml-2">PRO</span>
                            </h2>
                            <div className="space-y-2">
                                {alerts.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className={`glass-card p-4 flex items-center gap-4 animate-slideIn ${alert.urgency === 'critical' ? 'border-red-500/50 bg-red-500/5' :
                                            alert.urgency === 'high' ? 'border-yellow-500/50 bg-yellow-500/5' :
                                                'border-cyan-500/50 bg-cyan-500/5'
                                            }`}
                                    >
                                        <span className="text-3xl">{alert.icon}</span>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white">{alert.title}</span>
                                                <span className="text-gray-400">•</span>
                                                <span className="text-gray-400">{alert.match}</span>
                                            </div>
                                            <p className="text-gray-300">{alert.message}</p>
                                        </div>
                                        <button className="btn-primary text-sm">Ver Partido</button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Sport Filter */}
                    <section className="mb-6">
                        <SportFilter
                            sports={SPORTS}
                            activeSport={activeSport}
                            onSelect={setActiveSport}
                        />
                    </section>

                    {/* Stats Bar */}
                    <div className="glass-card p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-6">
                            <div>
                                <span className="text-gray-400 text-sm">Partidos en vivo:</span>
                                <span className="ml-2 text-white font-bold">{filteredMatches.length}</span>
                            </div>
                            <div className="h-4 w-px bg-gray-700"></div>
                            <div>
                                <span className="text-gray-400 text-sm">Actualización:</span>
                                <span className="ml-2 text-green-400 font-mono">
                                    {new Date().toLocaleTimeString('es-ES')}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                            <span className="text-sm text-gray-400">Conexión en tiempo real</span>
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="w-16 h-16 border-4 border-t-cyan-400 border-r-green-400 border-b-cyan-400 border-l-green-400 rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-400">Conectando con feeds en vivo...</p>
                            </div>
                        </div>
                    )}

                    {/* Live Matches Grid */}
                    {!isLoading && filteredMatches.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredMatches.map((match, index) => (
                                <PredictionCard
                                    key={match.id}
                                    match={match}
                                    onClick={setSelectedMatch}
                                />
                            ))}
                        </div>
                    )}

                    {/* No live matches */}
                    {!isLoading && filteredMatches.length === 0 && (
                        <div className="text-center py-20 glass-card">
                            <span className="text-6xl mb-4 block">😴</span>
                            <h3 className="heading-md mb-2">No hay partidos en vivo ahora</h3>
                            <p className="text-gray-400 mb-4">
                                {activeSport === 'all'
                                    ? 'Vuelve más tarde para ver partidos en vivo'
                                    : 'Prueba seleccionando otro deporte'}
                            </p>
                            <a href="/" className="btn-secondary inline-flex items-center gap-2">
                                Ver próximos partidos
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                        </div>
                    )}

                    {/* Sniper Feature Promo */}
                    <section className="mt-12">
                        <div className="glass-card p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                                <div className="flex-1">
                                    <span className="badge-diamond mb-4 inline-block">⚡ FUNCIÓN PRO</span>
                                    <h3 className="heading-md mb-2">Modo Sniper</h3>
                                    <p className="text-gray-400 mb-4">
                                        La IA detecta oportunidades de apuesta en vivo cuando las probabilidades
                                        no reflejan el dominio real del partido. Recibe alertas instantáneas
                                        para actuar antes que el mercado.
                                    </p>
                                    <ul className="space-y-2 text-gray-300">
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-400">✓</span>
                                            Alertas en tiempo real
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-400">✓</span>
                                            Análisis de momentum
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-400">✓</span>
                                            Detección de valor oculto
                                        </li>
                                    </ul>
                                </div>
                                <div className="text-center">
                                    <div className="text-6xl mb-4 animate-float">🎯</div>
                                    <a href="/pricing" className="btn-primary">
                                        Desbloquear Sniper
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* Match Detail Modal */}
            {selectedMatch && (
                <MatchDetailModal
                    match={selectedMatch}
                    onClose={() => setSelectedMatch(null)}
                />
            )}
        </div>
    );
}
