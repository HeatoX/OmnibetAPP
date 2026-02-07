'use client';

import { useSelection } from '@/context/SelectionContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function PrivateRoomModal({ isOpen, onClose }) {
    const { selections, removeMatch, clearSelection, stats } = useSelection();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#151725] w-full max-w-2xl rounded-2xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-xl">
                                🕵️‍♂️
                            </div>
                            <div>
                                <h2 className="text-white font-bold text-lg">Sala Privada</h2>
                                <p className="text-xs text-gray-400">Tus apuestas seleccionadas</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                            ✕
                        </button>
                    </div>

                    {/* Stats Bar */}
                    <div className="bg-black/40 p-4 grid grid-cols-3 gap-4 border-b border-gray-800">
                        <div className="text-center">
                            <div className="text-xs text-gray-400 uppercase tracking-wider">Total</div>
                            <div className="text-xl font-bold text-white">{stats.total}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs text-gray-400 uppercase tracking-wider">Aciertos</div>
                            <div className="text-xl font-bold text-green-400">{stats.won}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs text-gray-400 uppercase tracking-wider">Efectividad</div>
                            <div className={`text-xl font-black ${stats.accuracy > 50 ? 'text-cyan-400' : 'text-yellow-500'}`}>
                                {stats.accuracy}%
                            </div>
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {selections.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p className="text-4xl mb-4">📭</p>
                                <p>No hay partidos en tu sala privada.</p>
                                <p className="text-sm mt-2">Usa el botón <span className="text-cyan-400 font-bold text-lg">+</span> en las tarjetas para añadir.</p>
                            </div>
                        ) : (
                            selections.map(match => (
                                <div key={match.id} className="bg-gray-900/50 rounded-xl p-3 border border-gray-700 flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="text-xs text-gray-500 w-12 text-center">
                                            {match.prediction?.winner === 'home' ? 'GANA' : match.prediction?.winner === 'away' ? 'GANA' : 'EMPATE'}
                                            <div className="font-bold text-cyan-400 mt-1">
                                                {match.prediction?.winner === 'home' ? match.home.name : match.prediction?.winner === 'away' ? match.away.name : 'X'}
                                            </div>
                                        </div>
                                        <div className="h-8 w-[1px] bg-gray-700"></div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center text-sm font-medium text-white mb-1">
                                                <span>{match.home.name}</span>
                                                <span className="text-gray-500 text-xs">{match.status === 'finished' ? match.home.score : '-'}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm font-medium text-white">
                                                <span>{match.away.name}</span>
                                                <span className="text-gray-500 text-xs">{match.status === 'finished' ? match.away.score : '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeMatch(match.id)}
                                        className="ml-4 p-2 text-gray-500 hover:text-red-400 transition"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {selections.length > 0 && (
                        <div className="p-4 bg-gray-900 border-t border-gray-800 flex justify-end">
                            <button
                                onClick={clearSelection}
                                className="px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition"
                            >
                                Limpiar Sala
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
