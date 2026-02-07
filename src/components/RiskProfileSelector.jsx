"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Risk Profile Definitions
 */
const PROFILES = {
    conservative: {
        id: 'conservative',
        label: '🛡️ Inversor Seguro',
        description: 'Prioriza stakes altos en apuestas muy seguras (cuotas 1.20 - 1.50). Evita sorpresas.',
        color: 'bg-emerald-500',
        threshold: 75 // Only shows High confidence as "Recommended"
    },
    balanced: {
        id: 'balanced',
        label: '⚖️ Equilibrado',
        description: 'El balance perfecto entre riesgo y retorno. Busca valor (cuotas 1.50 - 2.20).',
        color: 'bg-blue-500',
        threshold: 60
    },
    degen: {
        id: 'degen',
        label: '🚀 High Roller',
        description: 'Busca "Value Bets" y sorpresas. Cuotas altas, riesgo alto. ¡A todo o nada!',
        color: 'bg-purple-600',
        threshold: 45 // Recommends risky bets too
    }
};

export default function RiskProfileSelector({ currentProfile, onUpdate }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg transition-all hover:scale-105 ${PROFILES[currentProfile]?.color || 'bg-gray-600'}`}
            >
                {PROFILES[currentProfile]?.label || 'Configurar Perfil'}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute right-0 mt-3 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-4 z-50 overflow-hidden"
                        >
                            <h3 className="text-white font-bold mb-2">Estilo de Apuesta</h3>
                            <p className="text-gray-400 text-xs mb-4">
                                Esto ajustará cómo la IA te recomienda los partidos y calcula los stakes.
                            </p>

                            <div className="space-y-2">
                                {Object.values(PROFILES).map((profile) => (
                                    <button
                                        key={profile.id}
                                        onClick={() => {
                                            onUpdate(profile.id);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-left p-3 rounded-lg border transition-all ${currentProfile === profile.id
                                                ? 'border-white/20 bg-white/10'
                                                : 'border-transparent hover:bg-white/5'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-sm text-white">{profile.label}</span>
                                            {currentProfile === profile.id && (
                                                <span className="text-xs text-green-400">Activo</span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-400 leading-tight">
                                            {profile.description}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

// Hook helper provided inline for portability
export function useRiskProfile() {
    const [profile, setProfile] = useState('balanced');
    const [config, setConfig] = useState(PROFILES.balanced);

    useEffect(() => {
        const saved = localStorage.getItem('omnibet_risk_profile');
        if (saved && PROFILES[saved]) {
            setProfile(saved);
            setConfig(PROFILES[saved]);
        }
    }, []);

    const updateProfile = (id) => {
        if (PROFILES[id]) {
            setProfile(id);
            setConfig(PROFILES[id]);
            localStorage.setItem('omnibet_risk_profile', id);
        }
    };

    return { profile, config, updateProfile };
}
