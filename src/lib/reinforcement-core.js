/**
 * Oráculo V50.0 - Protocolo Observador: Reinforcement Core
 * Aprendizaje por Refuerzo y Auto-Optimización de Pesos.
 * V42: Fixed weight normalization — prevents adding non-existent keys.
 */

/**
 * Dynamically corrects weights based on historical success (Self-Designing AI).
 * V42: Only modifies keys that exist in baseWeights, and normalizes sum to ~1.0.
 */
export function getOptimizedPolicy(competitionId, baseWeights) {
    if (!baseWeights || typeof baseWeights !== 'object') return baseWeights;

    const optimized = { ...baseWeights };

    // 1. In high-volatility leagues (Brazil/Argentina), reduce Poisson weight, boost ELO.
    if (competitionId?.includes('bra.1') || competitionId?.includes('arg.1')) {
        if ('poisson' in optimized) optimized.poisson = Math.max(0.05, optimized.poisson - 0.10);
        if ('elo' in optimized) optimized.elo += 0.05;
        if ('oracle' in optimized) optimized.oracle = Math.max(0.05, optimized.oracle - 0.10);
    }

    // 2. In Top Elite Leagues (Champions/Premier), boost market signal.
    if (competitionId?.includes('uefa.champions') || competitionId?.includes('eng.1')) {
        if ('market' in optimized) optimized.market += 0.10;
        if ('elo' in optimized) optimized.elo = Math.max(0.05, optimized.elo - 0.05);
        if ('poisson' in optimized) optimized.poisson = Math.max(0.05, optimized.poisson - 0.05);
    }

    // V42: Normalize weights to sum to 1.0
    const keys = Object.keys(optimized);
    const total = keys.reduce((sum, k) => sum + (optimized[k] || 0), 0);
    if (total > 0 && Math.abs(total - 1.0) > 0.01) {
        keys.forEach(k => {
            optimized[k] = Number((optimized[k] / total).toFixed(4));
        });
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
        return { elo: 0.1, oracle: 0.45, poisson: 0.1, market: 0.35 };
    }
    return null;
}
