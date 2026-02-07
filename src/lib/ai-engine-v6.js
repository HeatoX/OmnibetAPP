// ========================================
// OmniBet AI - V12.0 "The Oracle's Eye" Engine
// Implements Pattern Recognition & Hidden Markov Models (HMM)
// ========================================

import { calculateGoalExpectancy, calculatePoissonProbabilities } from './advanced-math';
import { detectOraclePatterns } from './pattern-scout';

// Helpers (Mocked or Imported) - For V6 we implement lean helpers here
const analyzeLineup = (lineup, injuries, leaders) => {
    let penalty = 0;
    if (injuries && injuries.length > 0) penalty += 0.05 * injuries.length;
    // Add logic for missing leaders if needed
    return penalty;
};

// V9.0 FATIGUE ENGINE (Bio-Rhythm)
const calculateFatigue = (games) => {
    if (!games || games.length < 2) return { penalty: 0, label: 'Fresco' };

    // Sort games by date desc
    const sorted = [...games].sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastGame = new Date(sorted[0].date);
    const today = new Date();

    // Days since last match
    const diffTime = Math.abs(today - lastGame);
    const daysRest = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let penalty = 0;

    // Heavy penalty for short rest (< 3 days is critical in pro sports)
    if (daysRest <= 2) penalty = 15; // Extreme fatigue
    else if (daysRest <= 3) penalty = 8; // High fatigue
    else if (daysRest <= 5) penalty = 2; // Normal rotation

    // Congestion: Check games in last 14 days
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(today.getDate() - 14);
    const recentCongestion = sorted.filter(g => new Date(g.date) > twoWeeksAgo).length;

    if (recentCongestion >= 4) penalty += 10; // 4 games in 2 weeks is brutal
    else if (recentCongestion === 3) penalty += 5;

    return { penalty, daysRest, congestion: recentCongestion };
};

function getConfidenceLevel(probability) {
    if (probability >= 75) return 'diamond';
    if (probability >= 60) return 'gold';
    return 'silver';
}

export function detectValueBet(prob, odds) {
    const impliedProb = (1 / odds) * 100;
    const edge = prob - impliedProb;
    return { isValue: edge > 5, edge: Math.round(edge) };
}

export function calculatePrediction(match, analysis, config = {}) {
    const sport = match.sport;
    const { homeForm, awayForm, rosters, leaders, injuries } = analysis || {};

    // Swarm Insights container
    const swarmInsights = [];

    // --- V6.0: DEEP ANALYTICAL MODEL (PYTHAGOREAN EXPECTATION) ---
    // Instead of arbitrary percentages, we calculate a "Power Rating" for each team.

    // 1. DATA EXTRACTION & ANALYSIS
    let homePower = 50; // Base score
    let awayPower = 50;

    // Helper: Parse Goals from Form
    const getStats = (games) => {
        let scored = 0, conceded = 0, points = 0, matches = 0;
        if (!games) return { s: 0, c: 0, p: 0, m: 0 };
        games.forEach(g => {
            if (!g.score) return;
            const p = g.score.split('-').map(Number);
            if (p.length === 2 && !isNaN(p[0])) {
                scored += p[0];
                conceded += p[1];
                if (p[0] > p[1]) points += 3;
                else if (p[0] === p[1]) points += 1;
                matches++;
            }
        });
        return { s: scored, c: conceded, p: points, m: matches };
    };

    const hStats = getStats(homeForm?.recentGames);
    const aStats = getStats(awayForm?.recentGames);

    // 2. ATTACK & DEFENSE RATINGS (Poisson-based)
    if (hStats.m > 0 && aStats.m > 0) {
        // Calculate Attack Power (Goals per game scaled)
        const hAttack = (hStats.s / hStats.m) * 20; // 2 goals/game = 40 pts
        const aAttack = (aStats.s / aStats.m) * 20;

        // Calculate Defense Power (Clean sheets/Low conceded reversed)
        const hDefense = 40 - ((hStats.c / hStats.m) * 15); // 0 conceded = 40 pts
        const aDefense = 40 - ((aStats.c / aStats.m) * 15);

        homePower += hAttack + hDefense;
        awayPower += aAttack + aDefense;

        if (hAttack > 25) swarmInsights.push(`🔥 Ataque letal local: ${(hStats.s / hStats.m).toFixed(1)} goles/partido.`);

        // Poisson Validation
        try {
            const hAvg = { scoredAvg: hStats.s / hStats.m, concededAvg: hStats.c / hStats.m };
            const aAvg = { scoredAvg: aStats.s / aStats.m, concededAvg: aStats.c / aStats.m };
            const { homeXG, awayXG } = calculateGoalExpectancy(hAvg, aAvg);
            const probs = calculatePoissonProbabilities(homeXG, awayXG);

            // Poisson adjusts the Power Balance directly
            const poissonDiff = (probs.homeWin - probs.awayWin) * 50; // Scale 0.1 -> 5 pts
            homePower += poissonDiff / 2;
            awayPower -= poissonDiff / 2;

            if (Math.abs(poissonDiff) > 10) {
                swarmInsights.push(`📐 Matemática xG: Proyecta ${(homeXG).toFixed(2)} vs ${(awayXG).toFixed(2)} goles.`);
            }
        } catch (e) { }
    }

    // 3. ROSTER IMPACT (Squad Depth)
    const hRosterPenalty = analyzeLineup(rosters?.home, analysis?.homeInjuries, leaders) * 100; // e.g. 0.1 * 100 = 10 pts
    const aRosterPenalty = analyzeLineup(rosters?.away, analysis?.awayInjuries, leaders) * 100;

    if (hRosterPenalty > 5) swarmInsights.push("⚠️ Debilidad crítica detectada en formación local.");

    homePower -= hRosterPenalty;
    awayPower -= aRosterPenalty;

    // 4. CONTEXTUAL FACTORS (Home, Weather, FATIGUE V9.0)
    const homeFieldPts = (sport === 'football' || sport === 'soccer') ? 12 : 6;
    homePower += homeFieldPts;

    // V9.0 BIO-RHYTHM (Fatigue & Congestion)
    const hFatigue = calculateFatigue(homeForm?.recentGames);
    const aFatigue = calculateFatigue(awayForm?.recentGames);

    if (hFatigue.penalty > 0) {
        homePower -= hFatigue.penalty;
        swarmInsights.push(`🔋 Desgaste Local: ${hFatigue.daysRest} días descanso (${hFatigue.congestion} juegos/14d). Impacto: -${hFatigue.penalty}%`);
    }

    if (aFatigue.penalty > 0) {
        awayPower -= aFatigue.penalty;
        swarmInsights.push(`🔋 Desgaste Visita: ${aFatigue.daysRest} días descanso (${aFatigue.congestion} juegos/14d). Impacto: -${aFatigue.penalty}%`);
    }

    // V10.0 TACTICAL SYNERGY (Style vs Weather)
    // Classify Styles
    const getStyle = (s, m) => (s / m) > 1.8 ? 'Attacking' : (s / m) < 1.0 ? 'Defensive' : 'Balanced';
    const hStyle = getStyle(hStats.s, hStats.m);
    const aStyle = getStyle(aStats.s, aStats.m);

    // Check Weather Interaction
    if (analysis?.weather?.conditions?.rain > 0 || analysis?.weather?.condition?.toLowerCase().includes('rain')) {
        if (hStyle === 'Attacking') {
            homePower -= 5;
            swarmInsights.push(`🌧️ Clima adverso penaliza estilo Ofensivo Local.`);
        }
        if (aStyle === 'Attacking') {
            awayPower -= 5;
            swarmInsights.push(`🌧️ Clima adverso penaliza estilo Ofensivo Visita.`);
        }
        // Defensive teams thrive in chaos
        if (hStyle === 'Defensive') homePower += 3;
        if (aStyle === 'Defensive') awayPower += 3;
    }

    // V11.0 SMART MONEY & REFEREE TRAP (The "Hidden" Layer)
    // 1. Market Sentiment (Public vs Sharps)
    // If stats say Home is strong (Power > 60) but Odds are high (> 2.0), it's a "Trap".
    if (homePower > 60 && config?.odds?.home > 2.0) {
        swarmInsights.push(`⚠️ TRAMPA DE MERCADO: El público apuesta Local, pero las Bookies pagan mucho. Cuidado.`);
        homePower -= 10; // Adjust for "The House Always Wins"
    }

    // 2. Referee Bias (Psychology)
    // Some refs favor home teams under pressure
    const isHighStakes = (match.league || '').includes('Champions') || (match.league || '').includes('Final');
    if (isHighStakes && analysis?.referee?.impact?.cardRisk === 'High') {
        swarmInsights.push(`⚖️ Árbitro Casero: En juegos de alta presión, ${analysis.referee.name} tiende a favorecer al local.`);
        homePower += 5;
    }

    // V12.0: THE ORACLE'S EYE (PATTERN RECOGNITION)
    const homeSequence = homeForm?.recentGames?.map(g => g.result) || [];
    const awaySequence = awayForm?.recentGames?.map(g => g.result) || [];

    // Simple "Giant" detection (Real Madrid, City, etc.)
    const giants = [
        'Real Madrid', 'Manchester City', 'Bayern München', 'Barcelona', 'Liverpool',
        'Paris Saint-Germain', 'Inter Milano', 'Napoli', 'Boca Juniors', 'River Plate',
        'Juventus', 'AC Milan', 'Arsenal', 'Manchester United', 'Monaco', 'AS Roma', 'Atletico Madrid'
    ];
    const homeIsGiant = giants.some(g => match.home?.name?.includes(g) || homeForm?.team?.includes(g));
    const awayIsGiant = giants.some(g => match.away?.name?.includes(g) || awayForm?.team?.includes(g));

    const oracleResult = detectOraclePatterns(homeSequence, awaySequence, homeIsGiant, awayIsGiant);

    if (oracleResult.patterns.length > 0) {
        oracleResult.patterns.forEach(p => {
            swarmInsights.push(`👁️ V12 [${p.title}]: ${p.description}`);
            if (p.impact === 'home') homePower += (p.strength === 'extreme' ? 15 : p.strength === 'high' ? 10 : 5);
            else if (p.impact === 'away') awayPower += (p.strength === 'extreme' ? 15 : p.strength === 'high' ? 10 : 5);
        });
    }

    // Apply State Multiplier
    homePower *= (oracleResult.homeState?.multiplier || 1);
    awayPower *= (oracleResult.awayState?.multiplier || 1);

    if (oracleResult.homeState?.id !== 'stable') {
        swarmInsights.push(`${oracleResult.homeState.icon} Estado Local: ${oracleResult.homeState.label}`);
    }
    if (oracleResult.awayState?.id !== 'stable') {
        swarmInsights.push(`${oracleResult.awayState.icon} Estado Visita: ${oracleResult.awayState.label}`);
    }

    // Weather Correction (General Risk)
    if (analysis?.weather?.impact?.riskFactor === 'high') {
        swarmInsights.push(`⛈️ ALERTA CLIMÁTICA: ${analysis.weather.conditions.rain}mm lluvia. Juego caótico.`);
        // Chaos reduces the gap between teams
        if (homePower > awayPower) homePower -= 10;
        else awayPower -= 10;
    }

    if (analysis?.referee?.impact?.cardRisk === 'High') {
        swarmInsights.push(`🟥 Árbitro estricto (${analysis.referee.name}). Alto riesgo de tarjetas.`);
    }

    // 5. PYTHAGOREAN EXPECTATION FORMULA
    // P(Win) = Power^2 / (Power^2 + OpponentPower^2)
    const hP2 = Math.pow(Math.max(10, homePower), 2); // Prevent negative/zero
    const aP2 = Math.pow(Math.max(10, awayPower), 2);

    let rawHomeProb = hP2 / (hP2 + aP2);
    let rawAwayProb = 1 - rawHomeProb;

    // Convert to Percentage 0-100
    let finalHomeProb = rawHomeProb * 100;
    let finalAwayProb = rawAwayProb * 100;

    // 6. DRAW CALCULATION (Derived from closeness)
    let drawProb = 0;
    if (sport === 'football' || sport === 'soccer') {
        const spread = Math.abs(finalHomeProb - finalAwayProb);
        // Inverse logistic curve suitable for soccer
        // If teams are equal (spread 0), Draw is 26% (Standard league avg)
        // If spread is 50%, Draw is negligible.
        drawProb = 26 * Math.exp(-0.04 * spread);

        // Normalize
        const factor = (100 - drawProb) / 100;
        finalHomeProb *= factor;
        finalAwayProb *= factor;
    }

    return {
        homeWinProb: Math.round(finalHomeProb),
        awayWinProb: Math.round(finalAwayProb),
        drawProb: Math.round(drawProb),
        confidence: getConfidenceLevel(Math.max(finalHomeProb, finalAwayProb)),
        numericConfidence: Math.round(Math.max(finalHomeProb, finalAwayProb)),
        swarmInsights,
        oracleV12: {
            homeState: oracleResult.homeState,
            awayState: oracleResult.awayState,
            patterns: oracleResult.patterns
        },
        metrics: {
            homePower: Math.round(homePower),
            awayPower: Math.round(awayPower)
        }
    };
}

// Simulates the match N times to determine outcome distribution
export function runMonteCarloSimulation(homeXG, awayXG, iterations = 2000) {
    let homeWins = 0;
    let draws = 0;
    let awayWins = 0;
    let totalGoals = 0;

    // Helper: Poisson Random Number Generator
    const getPoisson = (lambda) => {
        let L = Math.exp(-lambda);
        let p = 1.0;
        let k = 0;
        do {
            k++;
            p *= Math.random();
        } while (p > L);
        return k - 1;
    };

    for (let i = 0; i < iterations; i++) {
        const hGoals = getPoisson(homeXG);
        const aGoals = getPoisson(awayXG);

        totalGoals += (hGoals + aGoals);

        if (hGoals > aGoals) homeWins++;
        else if (hGoals === aGoals) draws++;
        else awayWins++;
    }

    return {
        iterations,
        homeWinPct: (homeWins / iterations) * 100,
        drawPct: (draws / iterations) * 100,
        awayWinPct: (awayWins / iterations) * 100,
        avgGoals: (totalGoals / iterations).toFixed(2)
    };
}
// Formula: f = (bp - q) / b
export function calculateKellyStake(probability, odds) {
    if (!odds || odds <= 1) return { percent: 0, amount: 0, reason: "No odds available" };

    // Safety: Use "Half Kelly" for reduced volatility
    const safetyFactor = 0.5;

    const p = probability / 100;
    const q = 1 - p;
    const b = odds - 1;

    let f = (b * p - q) / b;

    // Apply safety factor
    f *= safetyFactor;

    // Constraints (Max 5% of bankroll per bet)
    if (f > 0.05) f = 0.05;
    if (f < 0) f = 0;

    return {
        percent: (f * 100).toFixed(1),
        units: (f * 100 * 0.5).toFixed(1), // Scale: 100% bankroll = 50 units
        recommended: f > 0
    };
}
