/**
 * Oráculo Quantum (V40.0) - Risk & Bankroll Engine
 * Implements professional investment management for sport betting.
 */

/**
 * Calculates the optimal bet size using the Kelly Criterion.
 * Formula: f = (bp - q) / b
 * where f is the fraction of the bankroll to bet,
 * b is the decimal odds - 1,
 * p is the probability of winning,
 * q is the probability of losing (1 - p).
 * 
 * @param {number} probability - Internal IA probability (0.0 to 1.0)
 * @param {number} decimalOdds - Bookmaker decimal odds
 * @param {number} fraction - Fractional Kelly (e.g., 0.25 for Quarter-Kelly to be safer)
 */
export function calculateKellyStake(probability, decimalOdds, fraction = 0.25) {
    if (!probability || !decimalOdds || decimalOdds <= 1) return 0;

    const b = decimalOdds - 1;
    const p = probability;
    const q = 1 - p;

    // Full Kelly
    const f = (b * p - q) / b;

    // Apply fractional Kelly for risk mitigation + cap at 5% for safety
    const safeF = Math.max(0, f * fraction);
    return Number(Math.min(0.05, safeF).toFixed(4));
}

/**
 * Monte Carlo projection of bankroll growth.
 * @param {number} initialBank - Starting capital
 * @param {number} avgWinRate - Oracle average accuracy
 * @param {number} avgOdds - Oracle average odds
 * @param {number} numBets - Number of bets to simulate
 */
export function simulateBankrollGrowth(initialBank = 1000, avgWinRate = 0.55, avgOdds = 1.9, numBets = 100) {
    const trajectories = [];
    const numSimulations = 500;

    for (let i = 0; i < numSimulations; i++) {
        let currentBank = initialBank;
        const history = [initialBank];

        for (let j = 0; j < numBets; j++) {
            const stakePercent = calculateKellyStake(avgWinRate, avgOdds, 0.2); // Uses 1/5th Kelly
            const stakeAmount = currentBank * stakePercent;

            if (Math.random() < avgWinRate) {
                currentBank += stakeAmount * (avgOdds - 1);
            } else {
                currentBank -= stakeAmount;
            }
            history.push(Number(currentBank.toFixed(2)));
            if (currentBank < initialBank * 0.1) break; // Risk of Ruin
        }
        trajectories.push(history);
    }

    // Return the 50th percentile (median) trajectory
    trajectories.sort((a, b) => a[a.length - 1] - b[b.length - 1]);
    return trajectories[Math.floor(numSimulations / 2)];
}
