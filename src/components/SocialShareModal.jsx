"use client";
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SocialShareModal({ prediction, match, onClose }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const cardRef = useRef(null);

    const handleDownload = async () => {
        setIsGenerating(true);
        try {
            // Dynamic import to avoid SSR issues
            const html2canvas = (await import('html2canvas')).default;

            if (cardRef.current) {
                const canvas = await html2canvas(cardRef.current, {
                    backgroundColor: '#0f172a', // Dark background
                    scale: 2, // Retina quality
                    useCORS: true // Allow loading external images (logos)
                });

                const image = canvas.toDataURL("image/png");
                const link = document.createElement("a");
                link.href = image;
                link.download = `omnibet-${match.home.name}-vs-${match.away.name}.png`;
                link.click();
            }
        } catch (err) {
            console.error("Failed to generate image", err);
            alert("Error generating image. Please try again.");
        }
        setIsGenerating(false);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b border-gray-800">
                        <h3 className="text-lg font-bold text-white">Compartir Predicción</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                    </div>

                    {/* Preview Area */}
                    <div className="p-6 flex justify-center bg-gray-950">
                        {/* The Social Card Container */}
                        <div
                            ref={cardRef}
                            className="w-[320px] h-[400px] relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 to-black border border-gray-700 flex flex-col"
                        >
                            {/* Background Glow */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-cyan-400 to-purple-500"></div>

                            {/* OmniBet Brand */}
                            <div className="p-4 flex justify-between items-center z-10">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center text-black font-bold text-xs">O</div>
                                    <span className="text-white font-bold tracking-wider text-sm">OMNIBET AI</span>
                                </div>
                                <span className="text-[10px] text-gray-500 font-mono">ORACLE V6.0</span>
                            </div>

                            {/* Matchup */}
                            <div className="flex-1 flex flex-col items-center justify-center z-10 space-y-4">
                                <div className="flex items-center justify-center gap-4 w-full px-4">
                                    <div className="text-center w-1/3">
                                        <div className="text-2xl mb-1">{match.sport === 'football' ? '⚽' : '🏆'}</div>
                                        <div className="font-bold text-white uppercase text-xs truncate w-full">{match.home.name}</div>
                                    </div>
                                    <div className="text-gray-500 font-black text-xl">VS</div>
                                    <div className="text-center w-1/3">
                                        <div className="text-2xl mb-1">{match.sport === 'football' ? '⚽' : '🏆'}</div>
                                        <div className="font-bold text-white uppercase text-xs truncate w-full">{match.away.name}</div>
                                    </div>
                                </div>

                                {/* The Prediction */}
                                <div className="bg-white/5 mx-4 p-4 rounded-xl border border-white/10 w-[85%] backdrop-blur-md">
                                    <div className="text-center">
                                        <div className="text-xs text-cyan-400 font-bold uppercase tracking-widest mb-1">AI PREDICTION</div>
                                        <div className="text-xl font-black text-white leading-tight mb-2">
                                            {prediction.winner === 'home' ? match.home.name :
                                                prediction.winner === 'away' ? match.away.name : 'EMPATE'}
                                        </div>
                                        <div className="flex justify-center items-center gap-2">
                                            <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs border border-green-500/30">
                                                {prediction.probability || prediction.homeWinProb}% Confianza
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-black/40 text-center z-10">
                                <p className="text-[10px] text-gray-500">Generated by OmniBet AI • The Supreme Oracle</p>
                                <p className="text-[10px] text-cyan-500 mt-0.5">omnibet.ai</p>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
                            <div className="absolute -top-10 -left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 border-t border-gray-800 flex flex-col gap-3">
                        <button
                            onClick={handleDownload}
                            disabled={isGenerating}
                            className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                        >
                            {isGenerating ? 'Generando...' : '📸 Descargar Tarjeta'}
                        </button>
                        <p className="text-center text-xs text-gray-500">
                            Descarga la imagen y compártela en tus stories.
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
