'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import MiniPredictionCard from '@/components/MiniPredictionCard';
import TicketGenerator from '@/components/TicketGenerator';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext';
import { useSelection } from '@/context/SelectionContext';

export default function PrivateRoomPage() {
    const { user } = useAuth();
    const { profile } = useProfile();
    const { selections: savedPicks, removeMatch: removePick, clearSelection: clearAll } = useSelection();
    const [isTicketOpen, setIsTicketOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#050505]">
            <Header />

            {/* 
                LAYOUT STRATEGY COPY FROM app/page.jsx:
                1. marginTop: '170px' to clear fixed header + ticker.
                2. paddingLeft/Right: '10%' for consistent containment.
            */}
            <main className="relative z-10 pb-20" style={{ marginTop: '170px' }}>
                <div className="w-full mx-auto" style={{ paddingLeft: '10%', paddingRight: '10%' }}>

                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6 bg-white/5 p-6 rounded-2xl border border-white/5 shadow-xl backdrop-blur-sm">
                        <div>
                            <h1 className="text-3xl font-black text-white flex items-center gap-3">
                                <span className="text-4xl">🕵️</span> Sala Privada
                            </h1>
                            <p className="text-gray-400 mt-2 font-medium">
                                Tus selecciones persistentes (se borran al final del día).
                            </p>
                        </div>
                        {savedPicks.length > 0 && (
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsTicketOpen(true)}
                                    className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-cyan-500/20 hover:scale-105 transition-all flex items-center gap-2"
                                >
                                    <span>🖨️</span> Generar Ticket
                                </button>
                                <button
                                    onClick={clearAll}
                                    className="px-4 py-2 bg-red-900/30 text-red-400 border border-red-500/30 rounded-lg text-sm font-bold hover:bg-red-900/50 transition-colors"
                                >
                                    Borrar Todo
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    {savedPicks.length === 0 ? (
                        <div className="text-center py-24 bg-white/5 rounded-3xl border-2 border-dashed border-white/10 mx-auto max-w-2xl">
                            <div className="text-7xl mb-6 grayscale opacity-30">📭</div>
                            <h3 className="text-2xl font-bold text-gray-500">Tu sala está vacía</h3>
                            <p className="text-gray-400 mt-3 text-lg">Guarda predicciones para verlas aquí.</p>
                            <a href="/app" className="inline-block mt-8 px-8 py-3 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-all">
                                Volver al Dashboard &rarr;
                            </a>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {savedPicks.map((match) => (
                                <MiniPredictionCard
                                    key={match.id}
                                    match={match}
                                    onRemove={removePick}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* TICKET GENERATOR MODAL */}
            {isTicketOpen && (
                <TicketGenerator
                    matches={savedPicks}
                    onClose={() => setIsTicketOpen(false)}
                />
            )}
        </div>
    );
}
