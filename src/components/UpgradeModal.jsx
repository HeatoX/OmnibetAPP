'use client';

import Link from 'next/link';
import { useSubscription } from '@/context/SubscriptionContext';

/**
 * Modal shown when free user reaches prediction limit
 */
export default function UpgradeModal({ onClose }) {
    const { getSubscriptionInfo } = useSubscription();
    const subInfo = getSubscriptionInfo ? getSubscriptionInfo() : {};

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card max-w-md w-full p-8 relative animate-fadeIn">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
                >
                    ×
                </button>

                {/* Icon */}
                <div className="text-center mb-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-r from-yellow-500/20 to-cyan-500/20 
                                  rounded-full flex items-center justify-center text-5xl animate-pulse">
                        🔒
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-white text-center mb-2">
                    Límite de Predicciones Alcanzado
                </h2>

                <p className="text-gray-400 text-center mb-6">
                    Has usado tus <span className="text-cyan-400 font-bold">2 predicciones gratuitas</span> de este mes.
                </p>

                {/* Current Status */}
                <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400">Tu plan actual:</span>
                        <span className="text-white font-bold">Free</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-gray-400">Predicciones usadas:</span>
                        <span className="text-red-400 font-bold">{subInfo.used || 2}/2</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                        <div className="bg-red-500 h-2 rounded-full w-full"></div>
                    </div>
                </div>

                {/* Upgrade Options */}
                {/* Payment Options */}
                <div className="space-y-4 mb-6">
                    {/* DIAMOND PLAN */}
                    <div className="border border-cyan-500/30 bg-cyan-900/10 rounded-xl p-4 relative overflow-hidden group hover:border-cyan-500 transition-colors">
                        <div className="absolute top-0 right-0 bg-cyan-500 text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                            RECOMENDADO
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">💎 Plan Diamond</h3>
                        <p className="text-2xl font-black text-cyan-400 mb-3">$29.99<span className="text-sm font-normal text-gray-400">/mes</span></p>
                        <ul className="text-sm text-gray-300 space-y-1 mb-4">
                            <li>✓ Predicciones Ilimitadas</li>
                            <li>✓ Banker del Día (90% Win Rate)</li>
                            <li>✓ Alertas de Telegram</li>
                        </ul>
                        <div className="mt-4">
                            <Link
                                href="/pricing"
                                className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 group"
                            >
                                💳 Suscribirse (PayPal / Tarjeta)
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </Link>
                        </div>
                    </div>

                    {/* GOLD PLAN */}
                    <div className="border border-yellow-500/30 bg-yellow-900/10 rounded-xl p-4 hover:border-yellow-500 transition-colors">
                        <h3 className="text-lg font-bold text-white mb-1">⭐ Plan Gold</h3>
                        <p className="text-xl font-black text-yellow-400 mb-3">$9.99<span className="text-sm font-normal text-gray-400">/mes</span></p>
                        <Link
                            href="/pricing"
                            className="w-full bg-gray-700 text-white font-bold py-2 rounded-lg hover:bg-gray-600 transition-all block text-center text-sm"
                        >
                            Ver Plan Gold
                        </Link>
                    </div>
                </div>

                {/* Features comparison */}
                <div className="border-t border-gray-700 pt-6">
                    <p className="text-sm text-gray-400 text-center mb-4">
                        ¿Por qué actualizar?
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-300">
                            <span className="text-green-400">✓</span>
                            Predicciones ilimitadas
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                            <span className="text-green-400">✓</span>
                            Análisis H2H
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                            <span className="text-green-400">✓</span>
                            Stats de jugadores
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                            <span className="text-green-400">✓</span>
                            82% precisión
                        </div>
                    </div>
                </div>

                {/* Reset countdown */}
                <p className="text-xs text-gray-500 text-center mt-6">
                    Tu límite se reiniciará el 1 del próximo mes
                </p>
            </div>
        </div>
    );
}
