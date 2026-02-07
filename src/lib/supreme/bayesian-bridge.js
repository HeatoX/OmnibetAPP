/**
 * Bayesian Bridge (V30 Supreme)
 * Implements Bayesian Inference to update prior probabilities
 * based on new stochastic evidence (Market Drift & Physical Updates).
 */

/**
 * Bayesian Bridge (V30 Supreme) - Balanced Distribution
 */
export function refineWithBayesian(probs, evidence) {
    const { home, draw, away } = probs;
    let likelihood = 1.0;

    // Evidence: Market Velocity (Sharp money entering)
    if (evidence.marketVelocity > 0.05) likelihood += 0.15;
    else if (evidence.marketVelocity < -0.05) likelihood -= 0.15;

    // Evidence: Momentum Shift (Recent news/morale)
    if (evidence.momentumScore > 0.7) likelihood += 0.10;
    else if (evidence.momentumScore < 0.3) likelihood -= 0.10;

    // V30.3: Symmetric Symmetry Fix (Apply to the Favorite, not just Home)
    const isHomeFavorite = home >= away;
    let newHome = home;
    let newAway = away;

    if (isHomeFavorite) {
        newHome = home * likelihood;
    } else {
        newAway = away * likelihood;
    }

    // Redistribute to maintain 100%
    const currentSum = newHome + draw + newAway;
    const factor = 100 / (currentSum || 1);

    return {
        home: Math.round(newHome * factor),
        draw: Math.round(draw * factor),
        away: Math.round(newAway * factor),
        total: 100
    };
}

/**
 * Calculates the "Shift" between original AI and Supreme Bayesian view
 */
export function calculateSupremeShift(original, refined) {
    const diff = refined - original;
    return {
        direction: diff > 0 ? 'bullish' : (diff < 0 ? 'bearish' : 'stable'),
        magnitude: Math.abs(diff),
        label: diff > 0 ? `+${diff}%` : `${diff}%`
    };
}
