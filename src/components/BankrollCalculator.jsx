'use client';
import { useState } from 'react';

export default function BankrollCalculator({ isOpen, onClose }) {
    const [bankroll, setBankroll] = useState(1000);
    const [unitSize, setUnitSize] = useState(1); // 1% conservative

    if (!isOpen) return null;

    const calculateStake = (percentage) => {
        return Math.floor(bankroll * (percentage / 100));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#121218] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 p-6 border-b border-white/5 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black text-white flex items-center gap-2">
                            <span className="text-2xl">💰</span> Gestión de Bankroll
                        </h3>
                        <p className="text-emerald-400 text-xs font-mono mt-1">Kelly Criterion & Smart Staking</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Bankroll Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                            Tu Bankroll Total ($)
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <input
                                type="number"
                                value={bankroll}
                                onChange={(e) => setBankroll(Number(e.target.value))}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-8 pr-4 text-2xl font-mono text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Sensitivity Strategy */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Estrategia</label>
                            <span className="text-xs text-emerald-400">{unitSize}% por Unidad</span>
                        </div>
                        <input
                            type="range"
                            min="0.5"
                            max="5"
                            step="0.5"
                            value={unitSize}
                            onChange={(e) => setUnitSize(Number(e.target.value))}
                            className="w-full accent-emerald-500"
                        />
                        <div className="flex justify-between text-[10px] text-gray-600 font-mono mt-1">
                            <span>Conservador (0.5%)</span>
                            <span>Agresivo (5%)</span>
                        </div>
                    </div>

                    {/* Results Grid */}
                    <div className="grid grid-cols-1 gap-3">
                        {/* Diamond */}
                        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">💎</span>
                                <div>
                                    <div className="text-sm font-bold text-cyan-400">Apuesta Diamante</div>
                                    <div className="text-xs text-cyan-500/60">Alta Confianza (3 Unidades)</div>
                                </div>
                            </div>
                            <div className="text-xl font-mono font-black text-white">
                                ${calculateStake(unitSize * 3)}
                            </div>
                        </div>

                        {/* Gold */}
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">🥇</span>
                                <div>
                                    <div className="text-sm font-bold text-yellow-500">Apuesta Oro</div>
                                    <div className="text-xs text-yellow-500/60">Media Confianza (2 Unidades)</div>
                                </div>
                            </div>
                            <div className="text-xl font-mono font-black text-white">
                                ${calculateStake(unitSize * 2)}
                            </div>
                        </div>

                        {/* Silver */}
                        <div className="bg-gray-500/10 border border-gray-500/20 rounded-xl p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">🥈</span>
                                <div>
                                    <div className="text-sm font-bold text-gray-400">Apuesta Plata</div>
                                    <div className="text-xs text-gray-500/60">Baja Confianza (1 Unidad)</div>
                                </div>
                            </div>
                            <div className="text-xl font-mono font-black text-white">
                                ${calculateStake(unitSize * 1)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white/5 text-center text-[10px] text-gray-500">
                    Nunca apuestes dinero que no puedas permitirte perder.
                </div>
            </div>
        </div>
    );
}
