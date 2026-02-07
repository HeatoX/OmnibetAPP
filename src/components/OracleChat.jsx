'use client';

import { useState, useRef, useEffect } from 'react';

/**
 * AI Oracle Chat Widget
 * Provides real-time betting advice based on the active match data.
 */
export default function OracleChat({ matches }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: 'Hola! Soy el Oráculo de OmniBet. 🤖' },
        { type: 'bot', text: 'Pregúntame cosas como:\n"¿Cuál es la fija de hoy?"\n"Dame un parlay seguro"\n"¿Juega el Real Madrid?"' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { type: 'user', text: userMsg }]);
        setInput('');
        setIsTyping(true);

        // Simulate AI "Thinking"
        setTimeout(() => {
            const response = generateAIResponse(userMsg, matches);
            setMessages(prev => [...prev, { type: 'bot', text: response }]);
            setIsTyping(false);
        }, 1500);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-[#12121f] border border-cyan-500/30 w-80 h-96 rounded-2xl shadow-2xl flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-lg">🤖</div>
                            <div>
                                <h3 className="font-bold text-white text-sm">Oráculo AI</h3>
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    <span className="text-[10px] text-cyan-100">En línea</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">×</button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/40">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${msg.type === 'user'
                                        ? 'bg-cyan-600 text-white rounded-tr-none'
                                        : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                                    }`}>
                                    <p className="whitespace-pre-line">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3 border border-gray-700">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-gray-900 border-t border-gray-800 flex gap-2">
                        <input
                            type="text"
                            className="flex-1 bg-black/50 border border-gray-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                            placeholder="Pregunta algo..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            onClick={handleSend}
                            className="w-9 h-9 bg-cyan-600 rounded-full flex items-center justify-center text-white hover:bg-cyan-500 transition-colors"
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-3 rounded-full shadow-lg shadow-cyan-500/30 transition-all hover:scale-105"
                >
                    <span className="text-2xl">🤖</span>
                    <span className="font-bold pr-1">Preguntar al Oráculo</span>
                </button>
            )}
        </div>
    );
}

/**
 * Logic to generate AI responses locally based on available match data
 */
function generateAIResponse(query, matches) {
    const lowerQuery = query.toLowerCase();

    // 1. "Best Bet" / "Fija" / "Segura"
    if (lowerQuery.includes('fija') || lowerQuery.includes('segura') || lowerQuery.includes('mejor') || lowerQuery.includes('recomienda')) {
        const sorted = [...matches].sort((a, b) => (b.prediction?.oracleConfidence || 0) - (a.prediction?.oracleConfidence || 0));
        const best = sorted[0];

        if (best) {
            return `🔥 La "Fija" del día es **${best.home.name} vs ${best.away.name}**.\n\nEl sistema le da un **${best.prediction?.oracleConfidence}% de confianza** a ${best.prediction?.winner === 'home' ? 'Home' : 'Away'}. \n\n¡Es la jugada más sólida!`;
        } else {
            return "Aún estoy analizando los partidos de hoy. Vuelve en unos minutos.";
        }
    }

    // 2. Specific Team
    if (matches) {
        const foundMatch = matches.find(m =>
            m.home.name.toLowerCase().includes(lowerQuery) ||
            m.away.name.toLowerCase().includes(lowerQuery)
        );

        if (foundMatch) {
            const pred = foundMatch.prediction;
            const winner = pred.winner === 'home' ? foundMatch.home.name : foundMatch.away.name;
            return `He encontrado el partido:\n⚽ **${foundMatch.home.name} vs ${foundMatch.away.name}**\n\nMi predicción: Gana **${winner}** con ${pred.oracleConfidence}% de probabilidad.`;
        }
    }

    // 3. Parlay / Combinada
    if (lowerQuery.includes('parlay') || lowerQuery.includes('combinada')) {
        return "Para un Parlay seguro, te sugiero ir al **Constructor de Parlays** en el panel principal. Ahí he seleccionado automáticamente las 3 jugadas más seguras del día.";
    }

    // Default
    return "Interesante pregunta. 🤔\nSoy una IA entrenada para analizar deportes. Intenta preguntarme por un equipo específico o pídeme la 'fija del día'.";
}
