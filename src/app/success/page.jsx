'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        if (sessionId) {
            // Verify session with backend if needed
            setStatus('success');
        }
    }, [sessionId]);

    return (
        <div className="min-h-screen bg-grid flex items-center justify-center">
            <div className="bg-glow"></div>

            <div className="glass-card max-w-lg w-full mx-4 p-12 text-center relative z-10">
                {status === 'loading' ? (
                    <>
                        <div className="animate-spin text-6xl mb-6">⏳</div>
                        <h1 className="text-2xl font-bold text-white mb-4">Procesando...</h1>
                    </>
                ) : (
                    <>
                        {/* Success Animation */}
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-green-400 to-cyan-500 
                                      rounded-full flex items-center justify-center animate-bounce">
                            <span className="text-5xl">✓</span>
                        </div>

                        <h1 className="text-3xl font-bold text-white mb-4">
                            ¡Bienvenido a Premium!
                        </h1>

                        <p className="text-gray-400 mb-8">
                            Tu suscripción ha sido activada exitosamente. Ahora tienes acceso completo a todas las predicciones de alta confianza.
                        </p>

                        <div className="bg-gradient-to-r from-yellow-500/10 to-cyan-500/10 
                                      border border-yellow-500/30 rounded-2xl p-6 mb-8">
                            <h3 className="font-bold text-white mb-4">🎉 Tu nuevo plan incluye:</h3>
                            <ul className="text-left space-y-2 text-gray-300">
                                <li className="flex items-center gap-2">
                                    <span className="text-green-400">✓</span>
                                    Predicciones ilimitadas
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-400">✓</span>
                                    Análisis Head-to-Head detallado
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-400">✓</span>
                                    Estadísticas de jugadores y equipos
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-400">✓</span>
                                    Alertas de predicciones de alta confianza
                                </li>
                            </ul>
                        </div>

                        <Link
                            href="/"
                            className="inline-block btn-gradient px-8 py-4 rounded-xl font-bold text-lg"
                        >
                            🚀 Ver Predicciones Premium
                        </Link>

                        <p className="text-sm text-gray-500 mt-6">
                            Recibirás un email de confirmación en breve.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
