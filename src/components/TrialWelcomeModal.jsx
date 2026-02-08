'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TrialWelcomeModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative max-w-lg w-full glass-card overflow-hidden"
                    style={{
                        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
                        border: '1px solid rgba(234, 179, 8, 0.4)',
                        boxShadow: '0 0 50px rgba(234, 179, 8, 0.15)'
                    }}
                >
                    {/* Header Banner */}
                    <div className="h-2 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500"></div>

                    <div className="p-8 text-center">
                        <div className="w-20 h-20 bg-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-yellow-500/30">
                            <span className="text-4xl">🎁</span>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-2">¡Regalo de Bienvenida!</h2>
                        <p className="text-yellow-500 font-bold text-xl mb-6">Pase Gold Total: 7 Días Gratis</p>

                        <div className="bg-white/5 rounded-2xl p-6 mb-8 text-left border border-white/10">
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <span>🚀</span> Ya tienes activado:
                            </h3>
                            <ul className="space-y-3 text-gray-300">
                                <li className="flex items-center gap-3">
                                    <span className="text-green-400">✓</span>
                                    Predicciones ilimitadas (Todas)
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-green-400">✓</span>
                                    Análisis Head-to-Head Pro
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-green-400">✓</span>
                                    Alertas de Valor en tiempo real
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-green-400">✓</span>
                                    Estadísticas avanzadas IA
                                </li>
                            </ul>
                        </div>

                        <p className="text-gray-400 text-sm mb-8">
                            Disfruta de la experiencia completa de OmniBet AI.
                            Verás un temporizador en el menú indicando cuánto tiempo te queda.
                        </p>

                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-black font-bold rounded-xl text-lg hover:scale-[1.02] transition-all shadow-lg shadow-yellow-500/20"
                        >
                            ¡Empezar mi Prueba Gratis!
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
