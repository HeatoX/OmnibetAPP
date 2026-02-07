'use client';

import { useState, useEffect } from 'react';

export default function OraclePlayground() {
    const [scenario, setScenario] = useState({
        sport: 'soccer',
        homeForm: 80,
        awayForm: 50,
        h2h: 60,
        weather: 'clear',
        marketHeat: 'normal'
    });

    const [prediction, setPrediction] = useState(null);

    const calculateSimulatedResult = () => {
        // Logic simulator (Mirroring Oracle logic without heavy data fetching)
        let homeProb = 50 + (scenario.homeForm - scenario.awayForm) * 0.3;
        homeProb += (scenario.h2h - 50) * 0.2;

        if (scenario.weather === 'rain') homeProb -= 5;
        if (scenario.marketHeat === 'high_home') homeProb += 10;

        homeProb = Math.min(Math.max(homeProb, 10), 90);
        const awayProb = 100 - homeProb;

        setPrediction({
            home: Math.round(homeProb),
            away: Math.round(awayProb),
            confidence: homeProb > 70 || awayProb > 70 ? 'diamond' : 'gold'
        });
    };

    useEffect(() => {
        calculateSimulatedResult();
    }, [scenario]);

    return (
        <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-[2rem] border border-white/10 shadow-2xl">
            <h2 className="text-3xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                ORACLE PLAYGROUND <span className="text-xs bg-white/10 text-white px-2 py-1 rounded ml-2">SIMULADOR V3.0</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Controls */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs uppercase text-gray-500 font-bold mb-3 tracking-widest">Racha Local (%)</label>
                        <input
                            type="range" min="0" max="100" value={scenario.homeForm}
                            onChange={(e) => setScenario({ ...scenario, homeForm: parseInt(e.target.value) })}
                            className="w-full accent-cyan-500 bg-white/5 h-2 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-gray-500 font-bold mb-3 tracking-widest">Racha Visitante (%)</label>
                        <input
                            type="range" min="0" max="100" value={scenario.awayForm}
                            onChange={(e) => setScenario({ ...scenario, awayForm: parseInt(e.target.value) })}
                            className="w-full accent-blue-500 bg-white/5 h-2 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-gray-500 font-bold mb-3 tracking-widest">Dominancia Histórica H2H</label>
                        <input
                            type="range" min="0" max="100" value={scenario.h2h}
                            onChange={(e) => setScenario({ ...scenario, h2h: parseInt(e.target.value) })}
                            className="w-full accent-purple-500 bg-white/5 h-2 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-2 tracking-widest">Clima</label>
                            <select
                                value={scenario.weather}
                                onChange={(e) => setScenario({ ...scenario, weather: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-cyan-500"
                            >
                                <option value="clear">Despejado</option>
                                <option value="rain">Lluvia</option>
                                <option value="snow">Nieve</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-2 tracking-widest">Presión Mercado</label>
                            <select
                                value={scenario.marketHeat}
                                onChange={(e) => setScenario({ ...scenario, marketHeat: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-cyan-500"
                            >
                                <option value="normal">Normal</option>
                                <option value="high_home">Carga Local</option>
                                <option value="high_away">Carga Visita</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Result Preview */}
                <div className="bg-black/40 rounded-3xl p-8 border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute top-4 right-4 text-xs font-mono text-cyan-500/50">MATRIX_MODE_ON</div>

                    <div className="text-sm text-gray-400 uppercase tracking-widest mb-2 font-bold">Vedicto Proyectado</div>

                    {prediction && (
                        <>
                            <div className="text-4xl font-black mb-6 flex items-center gap-4">
                                <span className={prediction.home > prediction.away ? 'text-cyan-400' : 'text-gray-500 opacity-50'}>{prediction.home}%</span>
                                <span className="text-xl text-gray-700 font-light">vs</span>
                                <span className={prediction.away > prediction.home ? 'text-blue-400' : 'text-gray-500 opacity-50'}>{prediction.away}%</span>
                            </div>

                            <div className={`px-6 py-2 rounded-full font-black text-sm uppercase tracking-tighter ${prediction.confidence === 'diamond' ? 'bg-cyan-500 text-black shadow-[0_0_20px_#06b6d4]' : 'bg-yellow-500 text-black shadow-[0_0_20px_#eab308]'
                                }`}>
                                {prediction.confidence === 'diamond' ? '💎 ALTA CONFIANZA' : '🥇 CONFIANZA ORO'}
                            </div>

                            <p className="mt-8 text-xs text-gray-500 max-w-xs italic">
                                * Nota: Este es un entorno de simulación basado en los pesos actuales del motor AI. Los datos reales incluyen +400 variables adicionales.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
