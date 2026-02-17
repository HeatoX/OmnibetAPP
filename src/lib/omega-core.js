/**
 * Omega Protocol Core (V27)
 * The "Trinity Convergence" Engine
 * Holy Grail Logic: Fusing 3 layers of reality into a single certainty score.
 */

import { getTravelAudit, getRestAudit, getMarketAudit } from './matrix-engine.js';

/**
 * Calculates the Omega Score (Ω) for a match.
 * Fuses AI Engine (History), Matrix Engine (Physics), and Market Rhythm (Money).
 */
export function calculateOmegaScore(match, aiPrediction, physicalAnalysis) {
    if (!aiPrediction || !physicalAnalysis) return { score: 0, status: 'INSUFFICIENT_DATA' };

    // 1. Layer 1: Statistical Power (AI Engine)
    // Strength of the 100% historical/statistical prediction
    const statCertainty = Math.max(aiPrediction.homeWinProb, aiPrediction.awayWinProb);
    const primaryWinner = aiPrediction.homeWinProb > aiPrediction.awayWinProb ? 'home' : 'away';

    // 2. Layer 2: Physical Alignment (Matrix Engine)
    // Auditing the "Real World" state of the selected winner
    const homeRest = getRestAudit(physicalAnalysis?.homeForm?.recentGames?.[0]?.date);
    const awayRest = getRestAudit(physicalAnalysis?.awayForm?.recentGames?.[0]?.date);
    const travel = getTravelAudit(match.away, physicalAnalysis?.gameInfo?.venue || { city: 'London' });

    let physicalScore = 50; // Neutral start

    if (primaryWinner === 'home') {
        if (homeRest.status === 'FRESH') physicalScore += 20;
        if (homeRest.status === 'EXHAUSTED') physicalScore -= 30;
        if (travel.strain === 'SEVERE') physicalScore += 15; // Home advantage vs tired away team
    } else {
        if (awayRest.status === 'FRESH') physicalScore += 20;
        if (awayRest.status === 'EXHAUSTED') physicalScore -= 30;
        if (travel.strain === 'SEVERE') physicalScore -= 15; // Fatigue impact on traveling team
    }

    // 3. Layer 3: Market Rhythm (Exchange)
    // Professional money movement
    // Calculate implied probability movement from real odds
    const openProb = match.odds?.history?.[0] ? (1 / match.odds.history[0].home) : 0.45;
    const currentProb = match.odds?.home ? (1 / match.odds.home) : 0.45;
    const drift = currentProb - openProb;

    // Sentiment based on real drift
    const marketAlignment = drift > 0.05 ? 25 : (drift > -0.02 ? 10 : -20);

    // TOTAL CONVERGENCE CALCULATION
    // Ω = (Stats * 0.4) + (Physical * 0.3) + (Market * 0.3)
    const omega = (statCertainty * 0.4) + (physicalScore * 0.3) + (marketAlignment * 0.3) + 20;
    const finalOmega = Math.min(100, Math.max(0, Math.round(omega)));

    return {
        score: finalOmega,
        singular: finalOmega >= 90,
        trinity: {
            oracle: statCertainty >= 65 ? 'ALIGNED' : 'WEAK',
            matrix: physicalScore >= 60 ? 'ALIGNED' : 'DISRUPTED',
            market: marketAlignment >= 10 ? 'ALIGNED' : 'VOLATILE'
        },
        hash: `Ω-${match.id ? match.id.toString().slice(-4).toUpperCase() : 'BETA'}`
    };
}
