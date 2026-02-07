'use client';
import { useState, useEffect } from 'react';

export default function TicketGenerator({ matches, onClose }) {
    const [stake, setStake] = useState(10); // Default stake
    const [totalOdds, setTotalOdds] = useState(1);
    const [potentialWin, setPotentialWin] = useState(0);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        // Calculate Total Odds (Multiplier)
        // Default to 1.90 if no specific odds found (for simulation)
        const odds = matches.reduce((acc, match) => {
            // Try to find the odds for the predicted outcome
            // This is tricky because 'match' object might not have the exact grid.
            // We'll estimate or use what's available.
            // V22: Use a default safe 1.91 if missing, or use match.odds.home/away if we know the pick.
            // Since Private Room saves the *whole match*, we don't know EXACTLY which side user picked unless we saved it.
            // FIX: In SelectionContext we save the match. Check if 'prediction' has winner.

            let currentOdd = 1.90; // Default standard
            if (match.prediction?.winner === 'home' && match.odds?.home) currentOdd = parseFloat(match.odds.home);
            else if (match.prediction?.winner === 'away' && match.odds?.away) currentOdd = parseFloat(match.odds.away);
            else if (match.prediction?.winner === 'draw' && match.odds?.draw) currentOdd = parseFloat(match.odds.draw);

            return acc * (currentOdd || 1.0);
        }, 1);

        setTotalOdds(odds.toFixed(2));
    }, [matches]);

    useEffect(() => {
        setPotentialWin((stake * totalOdds).toFixed(2));
    }, [stake, totalOdds]);

    const handleCopy = () => {
        const date = new Date().toLocaleDateString();
        let text = `🎟️ *OMNIBET TICKET* - ${date}\n\n`;

        matches.forEach(m => {
            const pick = m.prediction?.winner === 'home' ? m.home.name :
                m.prediction?.winner === 'away' ? m.away.name : 'Empate';
            const odd = m.prediction?.winner === 'home' ? m.odds?.home :
                m.prediction?.winner === 'away' ? m.odds?.away : m.odds?.draw;

            text += `⚽ ${m.home.name} vs ${m.away.name}\n`;
            text += `👉 *${pick}* @ ${odd || '1.90'}\n\n`;
        });

        text += `💰 *Cuota Total:* ${totalOdds}\n`;
        text += `💵 *Apuesta:* $${stake}\n`;
        text += `🏆 *Posible Ganancia:* $${potentialWin}\n`;
        text += `\nGenerado por OmniBet AI 🤖`;

        navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white text-black w-full max-w-md rounded-none shadow-[0_0_50px_rgba(255,255,255,0.2)] overflow-hidden relative font-mono text-sm">

                {/* Receipt Header */}
                <div className="bg-black text-white p-4 text-center border-b-4 border-dashed border-gray-400">
                    <div className="text-2xl font-black tracking-widest uppercase">OmniBet</div>
                    <div className="text-xs uppercase tracking-[0.3em] text-gray-400">Official Digital Slip</div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4 bg-[#f8f9fa] relative">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500 border-b border-gray-300 pb-2">
                        <span>FECHA: {new Date().toLocaleDateString()}</span>
                        <span>ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                    </div>

                    <div className="space-y-4">
                        {matches.map((match, i) => {
                            const pick = match.prediction?.winner === 'home' ? match.home.name :
                                match.prediction?.winner === 'away' ? match.away.name : 'Empate';
                            const odd = match.prediction?.winner === 'home' ? match.odds?.home :
                                match.prediction?.winner === 'away' ? match.odds?.away : match.odds?.draw;

                            return (
                                <div key={i} className="flex flex-col">
                                    <div className="font-bold text-gray-800">{match.home.name} vs {match.away.name}</div>
                                    <div className="flex justify-between items-center text-gray-600">
                                        <span>👉 {pick}</span>
                                        <span className="font-bold">{odd || '1.90'}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="pt-4 border-t-2 border-black border-dashed space-y-2">
                        <div className="flex justify-between text-lg font-bold">
                            <span>CUOTA TOTAL:</span>
                            <span>{totalOdds}</span>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <span className="font-bold uppercase">Monto ($):</span>
                            <input
                                type="number"
                                value={stake}
                                onChange={(e) => setStake(parseFloat(e.target.value) || 0)}
                                className="w-24 p-1 border border-gray-400 rounded text-right bg-white font-bold focus:outline-none focus:border-black"
                            />
                        </div>

                        <div className="flex justify-between text-xl font-black bg-black text-white p-2 mt-2 -mx-2 transform -rotate-1 shadow-lg">
                            <span>GANANCIA:</span>
                            <span>${potentialWin}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-gray-100 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-200 transition-colors"
                    >
                        CERRAR
                    </button>
                    <button
                        onClick={handleCopy}
                        className={`flex-1 py-3 font-bold text-white transition-all flex items-center justify-center gap-2
                            ${isCopied ? 'bg-green-600' : 'bg-black hover:bg-gray-800'}`}
                    >
                        {isCopied ? 'COPIADO!' : 'COPIAR TEXTO'}
                    </button>
                </div>

                {/* Jagged Edge Effect */}
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-black"
                    style={{ clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)' }}>
                </div>
            </div>
        </div>
    );
}
