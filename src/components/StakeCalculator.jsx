'use client';

import { useState, useEffect } from 'react';
import { useRiskProfile } from './RiskProfileSelector';

/**
 * Stake Calculator Component
 * Uses Kelly Criterion to recommend optimal bet sizing
 */
export default function StakeCalculator({
    initialOdds = 2.0,
    initialConfidence = 50,
    bankroll = 1000
}) {
    const { config } = useRiskProfile(); // Get Global Risk Profile

    const [userBankroll, setUserBankroll] = useState(bankroll);
    const [odds, setOdds] = useState(initialOdds);
    const [confidence, setConfidence] = useState(initialConfidence);
    const [stake, setStake] = useState({ amount: 0, percentage: 0 });
    // Default Kelly fraction based on Risk Profile (Degen=0.5+, Balanced=0.3, Conservative=0.15)
    // Mapping config.threshold (conservative: 70, balanced: 60, degen: 50) to Kelly Fraction roughly
    const initialKelly = config?.id === 'degen' ? 0.75 : config?.id === 'balanced' ? 0.4 : 0.20;
    const [kellyFraction, setKellyFraction] = useState(initialKelly);

    // Sync when profile changes
    useEffect(() => {
        if (config?.id) {
            const newKelly = config.id === 'degen' ? 0.75 : config.id === 'balanced' ? 0.4 : 0.20;
            setKellyFraction(newKelly);
        }
    }, [config?.id]);

    // Calculate optimal stake
    useEffect(() => {
        if (!odds || !confidence) return;

        // Kelly Formula: f = (bp - q) / b
        // b = odds - 1 (net fractional odds)
        // p = probability of winning (confidence / 100)
        // q = probability of losing (1 - p)

        const b = odds - 1;
        const p = confidence / 100;
        const q = 1 - p;

        // Full Kelly fraction
        let f = (b * p - q) / b;

        // Apply conservative multiplier (Half Kelly is standard for safety)
        f = f * kellyFraction;

        // Ensure non-negative
        if (f < 0) f = 0;

        // Cap max stake at 10% for safety precaution
        if (f > 0.10) f = 0.10;

        const recommendedAmount = userBankroll * f;

        setStake({
            amount: recommendedAmount.toFixed(2),
            percentage: (f * 100).toFixed(1)
        });

    }, [userBankroll, odds, confidence, kellyFraction]);

    return (
        <div className="bg-[#12121f] rounded-xl border border-gray-700 p-5 mt-4">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🧮</span>
                <h3 className="text-lg font-bold text-white">Calculadora de Stake Pro</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Tu Bankroll ($)</label>
                    <input
                        type="number"
                        value={userBankroll}
                        onChange={(e) => setUserBankroll(Number(e.target.value))}
                        className="w-full bg-black/40 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-cyan-500 outline-none"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Cuota (Decimal)</label>
                    <input
                        type="number"
                        value={odds}
                        onChange={(e) => setOdds(Number(e.target.value))}
                        className="w-full bg-black/40 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-cyan-500 outline-none"
                    />
                </div>
            </div>

            <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Confianza del Modelo</span>
                    <span>{confidence}%</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={confidence}
                    onChange={(e) => setConfidence(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
            </div>

            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={() => setKellyFraction(0.25)}
                    className={`px-2 py-1 text-xs rounded border ${kellyFraction === 0.25 ? 'bg-cyan-900 border-cyan-500 text-cyan-400' : 'border-gray-700 text-gray-400'}`}
                >
                    Conservador (1/4)
                </button>
                <button
                    onClick={() => setKellyFraction(0.5)}
                    className={`px-2 py-1 text-xs rounded border ${kellyFraction === 0.5 ? 'bg-cyan-900 border-cyan-500 text-cyan-400' : 'border-gray-700 text-gray-400'}`}
                >
                    Normal (1/2)
                </button>
                <button
                    onClick={() => setKellyFraction(1)}
                    className={`px-2 py-1 text-xs rounded border ${kellyFraction === 1 ? 'bg-cyan-900 border-cyan-500 text-cyan-400' : 'border-gray-700 text-gray-400'}`}
                >
                    Full Kelly
                </button>
            </div>

            <div className="bg-gradient-to-r from-gray-900 to-black rounded-lg p-4 border border-gray-700 flex items-center justify-between relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-xs text-gray-400">Recomendación</p>
                    <p className="text-2xl font-black text-white">
                        ${stake.amount}
                        <span className="text-sm font-normal text-gray-400 ml-1">({stake.percentage}%)</span>
                    </p>
                </div>

                {Number(stake.percentage) > 0 && (
                    <div className="relative z-10 text-right">
                        <div className={`text-xl font-bold ${Number(stake.percentage) > 3 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {Number(stake.percentage) > 3 ? 'STRONG' : Number(stake.percentage) > 0 ? 'VALUE' : 'NO BET'}
                        </div>
                        <div className="text-xs text-gray-500">Valor Esperado</div>
                    </div>
                )}

                {/* Background glow based on value */}
                {Number(stake.percentage) > 0 && (
                    <div className={`absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l ${Number(stake.percentage) > 3 ? 'from-green-500/20' : 'from-yellow-500/20'} to-transparent blur-xl`}></div>
                )}
            </div>

            <p className="text-[10px] text-gray-500 mt-2 text-center">
                *Calculado usando criterio de Kelly ajustado para gestión de riesgo.
            </p>
        </div>
    );
}
