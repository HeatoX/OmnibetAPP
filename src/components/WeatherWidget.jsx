'use client';

/**
 * Weather Widget Component
 * Displays weather conditions for the match venue
 */
export default function WeatherWidget({ city, venue }) {
    return (
        <div className="glass-card p-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-20">
                <span className="text-6xl">🌤️</span>
            </div>

            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <span>🌤️</span> Condiciones Climáticas
            </h3>

            <div className="flex items-center gap-6">
                <div>
                    <div className="text-4xl font-bold text-white">18°C</div>
                    <div className="text-gray-400">Despejado</div>
                </div>

                <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Humedad</span>
                        <span className="text-white">45%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Viento</span>
                        <span className="text-white">12 km/h</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Prob. Lluvia</span>
                        <span className="text-white">5%</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
                <p className="text-xs text-blue-300">
                    💡 **Impacto IA:** El clima seco favorece un juego rápido y técnico.
                    Impacto positivo (+3%) para equipos con alta posesión.
                </p>
            </div>

            <div className="mt-3 text-[10px] text-gray-600 uppercase tracking-widest">
                Pronóstico para {venue}, {city}
            </div>
        </div>
    );
}
