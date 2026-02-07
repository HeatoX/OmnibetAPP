'use client';
import { useState } from 'react';

export default function PoissonLab({ isOpen, onClose }) {
    const [homeAvg, setHomeAvg] = useState(1.5);
    const [awayAvg, setAwayAvg] = useState(1.2);

    if (!isOpen) return null;

    // Poisson Formula: P(k; λ) = (e^-λ * λ^k) / k!
    const poisson = (k, lambda) => {
        let p = (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k);
        return p;
    };

    const factorial = (n) => {
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) result *= i;
        return result;
    };

    const calculateExactScore = () => {
        const scores = [];
        for (let h = 0; h <= 5; h++) {
            for (let a = 0; a <= 5; a++) {
                const prob = poisson(h, homeAvg) * poisson(a, awayAvg);
                scores.push({ score: `${h}-${a}`, prob: (prob * 100).toFixed(2) });
            }
        }
        return scores.sort((a, b) => b.prob - a.prob).slice(0, 5); // Top 5
    };

    const topScores = calculateExactScore();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#121218] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 p-6 border-b border-white/5 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black text-white flex items-center gap-2">
                            <span className="text-2xl">🧪</span> Poisson Lab
                        </h3>
                        <p className="text-indigo-400 text-xs font-mono mt-1">Exact Score Probabilities</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                        ✕
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Inputs */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Home xG</label>
                            <input
                                type="number" step="0.1" value={homeAvg}
                                onChange={(e) => setHomeAvg(Number(e.target.value))}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-center text-xl font-mono text-indigo-400 focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Away xG</label>
                            <input
                                type="number" step="0.1" value={awayAvg}
                                onChange={(e) => setAwayAvg(Number(e.target.value))}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-center text-xl font-mono text-pink-400 focus:outline-none focus:border-pink-500"
                            />
                        </div>
                    </div>

                    {/* Results */}
                    <div>
                        <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Most Likely Outcomes</h4>
                        <div className="space-y-3">
                            {topScores.map((s, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                    <span className="text-2xl font-black text-white tracking-widest">{s.score}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-24 bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${s.prob * 3}%` }}></div>
                                        </div>
                                        <span className="text-sm font-bold text-indigo-300 w-12 text-right">{s.prob}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
