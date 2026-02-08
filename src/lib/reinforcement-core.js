/**
 * Oráculo V50.0 - Protocolo Observador: Reinforcement Core
 * Aprendizaje por Refuerzo y Auto-Optimización de Pesos.
 */

/**
 * Dynamically corrects weights based on historical success (Self-Designing AI).
 */
export function getOptimizedPolicy(competitionId, baseWeights) {
    // In V50.0, the system would fetch its own Brier Scores from DB.
    // This simulated policy shows how a RL Agent would re-distribute energy.

    const optimized = { ...baseWeights };

    // Example Policy rules learned by the Reinforcement Agent:
    // 1. In high-volatility leagues (Brazil/Argentina), Narrative factor is more reliable than Poisson.
    if (competitionId?.includes('bra.1') || competitionId?.includes('arg.1')) {
        optimized.narrative = 0.20;
        optimized.poisson -= 0.10;
        optimized.elo += 0.05;
        optimized.oracle -= 0.15;
    }

    // 2. In Top Elite Leagues (Champions/Premier), Graph Stability (Chemistry) is paramount.
    if (competitionId?.includes('uefa.champions') || competitionId?.includes('eng.1')) {
        optimized.graph = 0.25;
        optimized.market += 0.05;
        optimized.elo -= 0.10;
        optimized.poisson -= 0.10;
        optimized.oracle += 0.10;
    }

    return optimized;
}

/**
 * V50: Exploration Strategy (Epsilon-Greedy)
 * Occasionally returns a "bold" or "non-standard" weight set to test new theories.
 */
export function getExplorationPolicy(isTestMode = false) {
    const epsilon = 0.15; // 15% exploration
    if (Math.random() < epsilon || isTestMode) {
        return { elo: 0.1, oracle: 0.45, poisson: 0.1, market: 0.1, narrative: 0.25 };
    }
    return null;
}
