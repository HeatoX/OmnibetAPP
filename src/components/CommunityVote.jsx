'use client';

import { useState, useEffect } from 'react';

/**
 * Community Vote Component
 * Allows users to agree/disagree with predictions and see community sentiment
 */
export default function CommunityVote({ matchId, initialVotes = null, userVote = null, onVote }) {
    const [votes, setVotes] = useState(initialVotes || { agree: 0, disagree: 0 });
    const [currentVote, setCurrentVote] = useState(userVote);
    const [isAnimating, setIsAnimating] = useState(false);

    const totalVotes = votes.agree + votes.disagree;
    const agreePercent = totalVotes > 0 ? Math.round((votes.agree / totalVotes) * 100) : 50;

    const handleVote = async (voteType) => {
        if (currentVote === voteType) return; // Already voted this way

        setIsAnimating(true);

        // Optimistic update
        const previousVote = currentVote;
        const newVotes = { ...votes };

        if (previousVote === 'agree') newVotes.agree--;
        if (previousVote === 'disagree') newVotes.disagree--;

        if (voteType === 'agree') newVotes.agree++;
        if (voteType === 'disagree') newVotes.disagree++;

        setVotes(newVotes);
        setCurrentVote(voteType);

        // Notify parent (for API call)
        if (onVote) {
            try {
                await onVote(matchId, voteType);
            } catch (error) {
                // Rollback on error
                setVotes(votes);
                setCurrentVote(previousVote);
            }
        }

        setTimeout(() => setIsAnimating(false), 300);
    };

    return (
        <div className="community-vote bg-black/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-400">
                    👥 Opinión de la Comunidad
                </h4>
                <span className="text-xs text-gray-500">
                    {totalVotes} {totalVotes === 1 ? 'voto' : 'votos'}
                </span>
            </div>

            {/* Vote Buttons */}
            <div className="flex gap-2 mb-3">
                <button
                    onClick={() => handleVote('agree')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${currentVote === 'agree'
                            ? 'bg-green-500 text-black'
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
                        } ${isAnimating ? 'scale-95' : ''}`}
                >
                    <span className="text-lg">👍</span>
                    <span>De Acuerdo</span>
                    <span className="font-bold">{votes.agree}</span>
                </button>

                <button
                    onClick={() => handleVote('disagree')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${currentVote === 'disagree'
                            ? 'bg-red-500 text-black'
                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                        } ${isAnimating ? 'scale-95' : ''}`}
                >
                    <span className="text-lg">👎</span>
                    <span>No Estoy De Acuerdo</span>
                    <span className="font-bold">{votes.disagree}</span>
                </button>
            </div>

            {/* Percentage Bar */}
            <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                    style={{ width: `${agreePercent}%` }}
                />
                <div
                    className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-500 to-red-400 transition-all duration-500"
                    style={{ width: `${100 - agreePercent}%` }}
                />
            </div>

            {/* Labels */}
            <div className="flex justify-between mt-2 text-xs">
                <span className="text-green-400">{agreePercent}% de acuerdo</span>
                <span className="text-red-400">{100 - agreePercent}% en contra</span>
            </div>

            {/* Social Proof */}
            {totalVotes > 5 && (
                <div className="mt-3 text-center text-xs text-gray-400">
                    {agreePercent >= 70 && (
                        <span className="text-green-400">🔥 La comunidad confía en esta predicción</span>
                    )}
                    {agreePercent <= 30 && (
                        <span className="text-yellow-400">⚠️ La comunidad tiene dudas sobre esta predicción</span>
                    )}
                    {agreePercent > 30 && agreePercent < 70 && (
                        <span>📊 Opiniones divididas en la comunidad</span>
                    )}
                </div>
            )}
        </div>
    );
}
