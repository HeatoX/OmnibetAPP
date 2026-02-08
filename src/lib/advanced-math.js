
/**
 * Advanced Mathematical Models for Sports Prediction
 * Based on open-source research from:
 * - vishant-mehta/ProSoccerPredictor
 * - octosport/octosport-python
 */

// 1. Poisson Distribution
// Calculates the probability of k events happening in an interval given lambda average rate.
// Used for predicting exact scores (e.g. probability of 2 goals given avg 1.5).
export function poisson(k, lambda) {
    const e = 2.718281828459045;
    return (Math.pow(lambda, k) * Math.pow(e, -lambda)) / factorial(k);
}

function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
}

// 2. Goal Expectancy (xG) Calculation
// Uses League Averages (Mocked here, usually scraped) to determine Team Attack/Defense Strength.
const LEAGUE_AVG_GOALS = 1.35; // Global approximation for top leagues

export function calculateGoalExpectancy(homeStats, awayStats, leagueAvg = LEAGUE_AVG_GOALS) {
    // Attack Strength = Team Scored Avg / League Avg
    // Defense Strength = Team Conceded Avg / League Avg

    // Fallbacks if no stats
    const homeScored = homeStats?.scoredAvg || 1.2;
    const homeConceded = homeStats?.concededAvg || 1.2;
    const awayScored = awayStats?.scoredAvg || 1.2;
    const awayConceded = awayStats?.concededAvg || 1.2;

    const homeAttack = homeScored / leagueAvg;
    const homeDefense = homeConceded / leagueAvg;
    const awayAttack = awayScored / leagueAvg;
    const awayDefense = awayConceded / leagueAvg;

    // Expected Goals = Attack * OpponentDefense * LeagueAvg
    // V30.1: Removed hardcoded 1.15 multiplier to avoid double-counting. 
    // Home advantage is now handled dynamically by the AI Engine.
    const homeXG = homeAttack * awayDefense * leagueAvg;
    const awayXG = awayAttack * homeDefense * leagueAvg;

    return { homeXG, awayXG };
}

// 3. Match Probability utilizing Poisson
// Returns { homeWin, draw, awayWin } probabilities (0-1)
export function calculatePoissonProbabilities(homeXG, awayXG) {
    let homeWin = 0;
    let draw = 0;
    let awayWin = 0;

    // Iterate through possible scores 0-0 to 10-10 (Expanded for Goleadas)
    for (let h = 0; h <= 10; h++) {
        for (let a = 0; a <= 10; a++) {
            const prob = poisson(h, homeXG) * poisson(a, awayXG);

            if (h > a) homeWin += prob;
            else if (h === a) draw += prob;
            else awayWin += prob;
        }
    }

    // V63.11: Add extreme parity jitter if values are identical
    if (Math.abs(homeWin - awayWin) < 0.01) {
        const jitter = (Math.random() - 0.5) * 0.02; // +/- 1%
        homeWin += jitter;
        awayWin -= jitter;
    }

    return { homeWin, draw, awayWin };
}

// 4. Monte Carlo Simulation Engine (V25 "The Quantum Oracle")
// Runs 10,000 simulations to determine win/draw/loss distribution
export function simulateMatchMultiverse(homeXG, awayXG, iterations = 10000) {
    let homeWins = 0;
    let draws = 0;
    let awayWins = 0;

    // Simple pseudo-random using xG as seed base for relative stability
    let seed = homeXG * 1000 + awayXG * 100;
    const seededRandom = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };

    for (let i = 0; i < iterations; i++) {
        // V30.3: Poisson-distributed goals now with fresh randomness each step
        const homeGoals = generatePoissonValue(homeXG);
        const awayGoals = generatePoissonValue(awayXG);

        if (homeGoals > awayGoals) homeWins++;
        else if (homeGoals === awayGoals) draws++;
        else awayWins++;
    }

    return {
        homeWinProb: (homeWins / iterations) * 100,
        drawProb: (draws / iterations) * 100,
        awayWinProb: (awayWins / iterations) * 100,
        iterations
    };
}

// Helper: Inverse transform sampling for Poisson
// V30.3: Fixed Atomic Randomness (New seed inside loop)
function generatePoissonValue(lambda) {
    let L = Math.exp(-lambda);
    let p = 1.0;
    let k = 0;
    do {
        k++;
        p *= Math.random();
    } while (p > L);
    return k - 1;
}

// 5. Advanced Score Matrix (Exact Scores)
export function calculateScoreMatrix(homeXG, awayXG) {
    const scores = [];
    for (let h = 0; h <= 4; h++) {
        for (let a = 0; a <= 4; a++) {
            const prob = poisson(h, homeXG) * poisson(a, awayXG);
            scores.push({
                score: `${h}-${a}`,
                prob: Math.round(prob * 10000) / 100 // Percentage with 2 decimals
            });
        }
    }
    // Return Top 5 most likely scores
    return scores.sort((a, b) => b.prob - a.prob).slice(0, 5);
}

// 6. ELO Rating Simulation (Simplified)
export function calculateNewElo(currentElo, opponentElo, actualScore, kFactor = 32) {
    const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - currentElo) / 400));
    return currentElo + kFactor * (actualScore - expectedScore);
}
