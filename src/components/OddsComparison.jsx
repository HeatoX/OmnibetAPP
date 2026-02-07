'use client';

/**
 * Odds Comparison Component
 * Displays bookmaker odds and highlights the best value
 */
export default function OddsComparison({ bookmakers, prediction }) {
    if (!bookmakers || bookmakers.length === 0) return (
        <div className="text-center py-6 text-gray-500">
            No hay datos de cuotas disponibles para este partido.
        </div>
    );

    // Find best odds for each outcome
    const bestOdds = {
        home: Math.max(...bookmakers.map(b => b.odds.home || 0)),
        draw: Math.max(...bookmakers.map(b => b.odds.draw || 0)),
        away: Math.max(...bookmakers.map(b => b.odds.away || 0))
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">📈 Comparador de Cuotas</h3>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-gray-400 text-sm border-b border-gray-700">
                            <th className="p-3 font-medium">Casa de Apuestas</th>
                            <th className="p-3 font-medium text-center">1 (Local)</th>
                            <th className="p-3 font-medium text-center">X (Empate)</th>
                            <th className="p-3 font-medium text-center">2 (Visita)</th>
                            <th className="p-3 font-medium text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookmakers.map((bookie, idx) => (
                            <tr key={idx} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                                <td className="p-3 flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] text-white shadow-lg"
                                        style={{ backgroundColor: bookie.color }}
                                    >
                                        {bookie.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="font-medium text-white">{bookie.name}</span>
                                </td>

                                <td className="p-3 text-center">
                                    <OddsCell
                                        value={bookie.odds.home}
                                        isBest={bookie.odds.home === bestOdds.home}
                                        isPredicted={prediction?.winner === 'home'}
                                    />
                                </td>

                                <td className="p-3 text-center">
                                    <OddsCell
                                        value={bookie.odds.draw}
                                        isBest={bookie.odds.draw === bestOdds.draw}
                                        isPredicted={prediction?.winner === 'draw'}
                                    />
                                </td>

                                <td className="p-3 text-center">
                                    <OddsCell
                                        value={bookie.odds.away}
                                        isBest={bookie.odds.away === bestOdds.away}
                                        isPredicted={prediction?.winner === 'away'}
                                    />
                                </td>

                                <td className="p-3 text-right">
                                    <button className="text-xs bg-gray-800 hover:bg-cyan-600 text-gray-300 hover:text-white px-3 py-1.5 rounded transition-colors">
                                        Apostar ↗
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-xl flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                    <h4 className="font-bold text-cyan-400 text-sm">Consejo de Omnibet</h4>
                    <p className="text-xs text-gray-300 mt-1">
                        La mejor cuota para tu predicción ({prediction?.winner === 'home' ? 'Local' : prediction?.winner === 'away' ? 'Visita' : 'Empate'})
                        es <span className="font-bold text-white">{prediction?.winner === 'home' ? bestOdds.home : prediction?.winner === 'away' ? bestOdds.away : bestOdds.draw}</span>.
                        Elegir la mejor cuota puede aumentar tus ganancias en un 5-10% a largo plazo.
                    </p>
                </div>
            </div>
        </div>
    );
}

function OddsCell({ value, isBest, isPredicted }) {
    if (!value) return <span className="text-gray-600">-</span>;

    return (
        <div className={`
            inline-flex flex-col items-center justify-center rounded-lg px-2 py-1 min-w-[60px]
            ${isBest ? 'bg-green-500/20 border border-green-500/50' : ''}
            ${isPredicted && !isBest ? 'bg-cyan-500/10 border border-cyan-500/30' : ''}
        `}>
            <span className={`font-bold ${isBest ? 'text-green-400' : 'text-gray-300'}`}>
                {value.toFixed(2)}
            </span>
            {isBest && <span className="text-[10px] text-green-500 font-bold uppercase">Mejor</span>}
        </div>
    );
}

export function WeatherWidget({ city, venue }) {
    return (
        <div className="glass-card p-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>

            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <span>🌦️</span> Condiciones Climáticas
            </h3>

            <div className="flex items-center gap-6">
                <div className="text-center">
                    <div className="text-4xl mb-1">☀️</div>
                    <div className="text-2xl font-bold text-white">22°C</div>
                    <div className="text-xs text-gray-400 capitalize">Despejado</div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="p-3 bg-black/30 rounded-xl">
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Viento</div>
                        <div className="text-sm text-white font-medium">12 km/h NE</div>
                    </div>
                    <div className="p-3 bg-black/30 rounded-xl">
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Humedad</div>
                        <div className="text-sm text-white font-medium">45%</div>
                    </div>
                    <div className="p-3 bg-black/30 rounded-xl">
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Lluvia</div>
                        <div className="text-sm text-white font-medium">0%</div>
                    </div>
                    <div className="p-3 bg-black/30 rounded-xl">
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Visibilidad</div>
                        <div className="text-sm text-white font-medium">Óptima</div>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-gray-500 italic">
                Predicción para {venue}, {city} a la hora del partido.
            </div>
        </div>
    );
}
