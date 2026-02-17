// ========================================
// OmniBet AI - MONSTER AGENTS (ChatDev Inspired)
// Advanced specialized agents for the "Monster Oracle"
// ========================================

import { BaseAgent } from './scout-agents.js';
import { runMonteCarloSimulation } from '../ai-engine-v6.js';
import { identifyTacticalADN, getTacticalAdvantage } from '../tactical-adn.js';
import { calculateGoalExpectancy } from '../advanced-math.js';

/**
 * SIMULATION AGENT (The "Dr. Strange" of Agents)
 * Runs 1000+ Monte Carlo simulations per match to find the most likely exact score.
 */
export class SimulationAgent extends BaseAgent {
    constructor() {
        super('Simulation Monster', 'predictor', 10);
    }

    async process({ homeStats, awayStats, iterations = 1000 }) {
        // Safe defaults
        const hS = homeStats || { s: 1.5, c: 1.0, m: 1 };
        const aS = awayStats || { s: 1.0, c: 1.5, m: 1 };

        const hAvg = { scoredAvg: (hS.goalsFor || 1.5) / (hS.played || 1), concededAvg: (hS.goalsAgainst || 1.0) / (hS.played || 1) };
        const aAvg = { scoredAvg: (aS.goalsFor || 1.0) / (aS.played || 1), concededAvg: (aS.goalsAgainst || 1.5) / (aS.played || 1) };

        // Calculate Expected Goals (xG) based on Poisson
        const { homeXG, awayXG } = calculateGoalExpectancy(hAvg, aAvg);

        // Run Monte Carlo
        const simulation = runMonteCarloSimulation(homeXG, awayXG, iterations);

        // Find Most Likely Exact Score (Simple Poisson distribution logic)
        // Note: runMonteCarloSimulation returns aggregate stats, we calculate exact score probability here
        const exactScore = this.calculateMostLikelyScore(homeXG, awayXG);

        return {
            xG: { home: homeXG.toFixed(2), away: awayXG.toFixed(2) },
            simulationStats: simulation,
            mostLikelyScore: exactScore,
            verdict: simulation.homeWinPct > simulation.awayWinPct ? 'home' : 'away',
            confidence: Math.max(simulation.homeWinPct, simulation.awayWinPct).toFixed(1) + '%'
        };
    }

    calculateMostLikelyScore(homeXG, awayXG) {
        // Poisson probability function
        const poisson = (k, lambda) => (Math.pow(lambda, k) * Math.exp(-lambda)) / this.factorial(k);

        let maxProb = 0;
        let score = "1-1"; // Default fallback

        // Check scores from 0-0 to 5-5
        for (let h = 0; h <= 5; h++) {
            for (let a = 0; a <= 5; a++) {
                const prob = poisson(h, homeXG) * poisson(a, awayXG);
                if (prob > maxProb) {
                    maxProb = prob;
                    score = `${h}-${a}`;
                }
            }
        }
        return score;
    }

    factorial(n) {
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) result *= i;
        return result;
    }
}

/**
 * TACTICAL AGENT (The "Pep Guardiola" of Agents)
 * Analyzes stylistic matchups to find hidden advantages.
 */
export class TacticalAgent extends BaseAgent {
    constructor() {
        super('Tactical Monster', 'analyst', 9);
    }

    async process({ homeTeam, awayTeam, homeStats, awayStats, leaders }) {
        // Identify styles
        // We need a way to pass leaders/stats correctly. 
        // For now, we simulate passing them or use defaults if missing.

        const hLeaders = leaders?.home || [];
        const hRecent = homeStats?.recentGames || []; // Assuming stats object has recentGames attached in orchestrator
        const hADN = identifyTacticalADN(homeTeam, hLeaders, hRecent);

        const aLeaders = leaders?.away || [];
        const aRecent = awayStats?.recentGames || [];
        const aADN = identifyTacticalADN(awayTeam, aLeaders, aRecent);

        // Calculate Advantage
        const tacticalAdvantage = getTacticalAdvantage(hADN, aADN);

        let impactDescription = "Matchup Equilibrado";
        let favoredSide = "Neutral";

        if (tacticalAdvantage > 1.05) {
            favoredSide = "Home";
            impactDescription = `Estilo por Local (${hADN.label}) domina a Visita (${aADN.label})`;
        } else if (tacticalAdvantage < 0.95) {
            favoredSide = "Away";
            impactDescription = `Estilo Visita (${aADN.label}) contrarresta al Local (${hADN.label})`;
        }

        return {
            homeStyle: hADN,
            awayStyle: aADN,
            tacticalMultiplier: tacticalAdvantage, // > 1 favors Home, < 1 favors Away
            favoredSide,
            analysis: impactDescription
        };
    }
}
