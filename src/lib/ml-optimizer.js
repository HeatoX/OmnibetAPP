/**
 * Machine Learning Optimizer (v6.0)
 * "The Supreme Upgrade"
 * 
 * Analyzes historical prediction accuracy to dynamically adjust 
 * the weight influence of each factor (Form, Odds, Home Advantage).
 */

import { calculateStats } from './history-tracker';

// Default Weights (Starting Point)
const DEFAULT_WEIGHTS = {
    oddsWeight: 0.35,      // REDUCED: Don't trust market traps (Was 0.60)
    formWeight: 0.45,      // INCREASED: Trust real performance (Was 0.25)
    h2hWeight: 0.15,       // History counts (Was 0.10)
    motivationWeight: 0.05
};

// Module-level cache for weights
let cachedWeights = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

/**
 * Calculate Optimized Weights based on History
 * Returns a weight config object that evolves over time.
 */
export async function getDynamicWeights() {
    // Return cache if valid
    const now = Date.now();
    if (cachedWeights && (now - lastFetchTime < CACHE_DURATION)) {
        return cachedWeights;
    }

    try {
        console.log('🧠 ML: Fetching fresh weights config...');
        // 1. Get History
        const stats = await Promise.race([
            calculateStats(),
            new Promise((resolve) => setTimeout(() => resolve({ total: 0, winRate: 0 }), 3000))
        ]).catch(() => ({ total: 0, winRate: 0 }));

        // If we have little data, return defaults
        if (stats.total < 30) {
            cachedWeights = { ...DEFAULT_WEIGHTS, version: 'v6.0-static' };
            lastFetchTime = now;
            return cachedWeights;
        }

        let newWeights = { ...DEFAULT_WEIGHTS };
        const accuracy = parseFloat(stats.winRate);

        if (accuracy > 72) {
            newWeights.oddsWeight = 0.45;
            newWeights.formWeight = 0.40;
        } else if (accuracy < 60) {
            newWeights.oddsWeight = 0.20;
            newWeights.formWeight = 0.65;
            newWeights.motivationWeight = 0.10;
        }

        cachedWeights = {
            ...newWeights,
            version: `v6.1-${accuracy > 70 ? 'Stable' : 'Adaptive'}`,
            dataPoints: stats.total,
            lastOptimized: new Date().toISOString()
        };

        lastFetchTime = now;
        return cachedWeights;

    } catch (error) {
        console.error('ML Optimizer Failed:', error);
        return DEFAULT_WEIGHTS;
    }
}

/**
 * Learning Loop
 * Can be called periodically to "Retrain" the brain
 */
export async function runTrainingLoop() {
    console.log('🧠 ML: Starting Training Session...');
    const weights = await getDynamicWeights();
    console.log('🧠 ML: Optimization Complete.', weights);
    return weights;
}
