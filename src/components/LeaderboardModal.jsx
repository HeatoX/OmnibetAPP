'use client';

import { useState, useEffect } from 'react';
import { getLeaderboard } from '@/lib/history-tracker';

export default function LeaderboardModal({ onClose }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                const data = await getLeaderboard();
                setUsers(data);
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            }
            setLoading(false);
        }
        fetchLeaderboard();
    }, []);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#12121f] border border-gray-700 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <div className="bg-gradient-to-r from-yellow-900/40 to-black p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">🏆</span>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Top Apostadores</h2>
                            <p className="text-sm text-yellow-500">Los usuarios con mayor precisión del mes</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-0 overflow-y-auto max-h-[60vh]">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin text-4xl text-yellow-500">🏆</div>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-gray-400 text-xs uppercase sticky top-0 backdrop-blur-sm">
                                <tr>
                                    <th className="px-6 py-4 font-medium text-center w-16">#</th>
                                    <th className="px-6 py-4 font-medium">Usuario</th>
                                    <th className="px-6 py-4 font-medium text-center">Win Rate</th>
                                    <th className="px-6 py-4 font-medium text-center">Racha</th>
                                    <th className="px-6 py-4 font-medium text-right">Profit Est.</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {users.map((user, idx) => (
                                    <tr key={idx} className={`hover:bg-white/5 transition-colors ${idx < 3 ? 'bg-yellow-500/5' : ''}`}>
                                        <td className="px-6 py-4 text-center">
                                            {idx === 0 && <span className="text-2xl">🥇</span>}
                                            {idx === 1 && <span className="text-2xl">🥈</span>}
                                            {idx === 2 && <span className="text-2xl">🥉</span>}
                                            {idx > 2 && <span className="text-gray-500 font-bold">{user.rank}</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                                                    ${user.tier === 'diamond' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/50' :
                                                        user.tier === 'gold' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/50' :
                                                            'bg-gray-700 text-gray-300'}`}>
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium">{user.name}</div>
                                                    <div className="text-[10px] uppercase tracking-wider text-gray-500">{user.tier}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-green-400 font-bold">{user.winRate}%</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {user.streak > 0 ? (
                                                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">🔥 {user.streak}W</span>
                                            ) : (
                                                <span className="text-gray-600">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-white font-mono">${user.profit}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-900 border-t border-gray-800 text-center">
                    <p className="text-xs text-gray-500">
                        Top 1 del mes gana <span className="text-cyan-400 font-bold">1 mes de Diamond Gratis 💎</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
