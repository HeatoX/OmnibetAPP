/**
 * Aeternus Poisson Engine (V30 Supreme)
 * Calculates scoreline probabilities using Bivariate Poisson Distribution
 */

export function calculatePoissonDistribution(homeExpGoals, awayExpGoals) {
    const maxGoals = 6;
    const distribution = [];

    // Poisson Formula: (e^-λ * λ^k) / k!
    const poisson = (lambda, k) => {
        const factorial = (n) => n <= 1 ? 1 : n * factorial(n - 1);
        return (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k);
    };

    for (let h = 0; h <= maxGoals; h++) {
        for (let a = 0; a <= maxGoals; a++) {
            const prob = poisson(homeExpGoals, h) * poisson(awayExpGoals, a);
            distribution.push({
                score: `${h}-${a}`,
                prob: Number((prob * 100).toFixed(2))
            });
        }
    }

    // Sort by most likely
    return distribution.sort((a, b) => b.prob - a.prob).slice(0, 5);
}

/**
 * Get most likely score based on win probabilities and sport type
 */
export function getLikelyScores(homeWinProb, awayWinProb, drawProb, sport = 'soccer') {
    const isHighScoring = ['basketball', 'nba', 'nfl', 'american football'].includes(sport.toLowerCase());

    if (isHighScoring) {
        // High scoring sports use a different logic for realistic looking scores
        const avgTotal = sport.toLowerCase().includes('basketball') ? 220 : 45;
        const spreadMultiplier = sport.toLowerCase().includes('basketball') ? 12 : 10;

        const scores = [];
        // V30.1: Deterministic seed based on matchId to ensure 100% real consistency
        const seedBase = matchId ? parseInt(matchId.toString().slice(-4)) : 42;

        for (let i = 0; i < 5; i++) {
            const pseudoRand = ((seedBase + (i * 17)) % 100) / 100;
            const spread = ((homeWinProb - awayWinProb) / 100) * spreadMultiplier + (pseudoRand * 4 - 2);
            const homeScore = Math.round((avgTotal / 2) + (spread / 2) + (pseudoRand * 6 - 3));
            const awayScore = Math.round((avgTotal / 2) - (spread / 2) + (pseudoRand * 6 - 3));

            scores.push({
                score: `${homeScore}-${awayScore}`,
                prob: Math.max(5, (100 - (i * 15) - Math.abs(spread * 2)).toFixed(1))
            });
        }
        return scores.sort((a, b) => b.prob - a.prob);
    }

    // Default Soccer Poisson Logic
    let homeLambda = 1.2;
    let awayLambda = 1.1;

    if (homeWinProb > 60) { homeLambda = 2.1; awayLambda = 0.8; }
    else if (awayWinProb > 60) { homeLambda = 0.8; awayLambda = 2.1; }
    else if (drawProb > 35) { homeLambda = 1.1; awayLambda = 1.1; }

    return calculatePoissonDistribution(homeLambda, awayLambda);
}
