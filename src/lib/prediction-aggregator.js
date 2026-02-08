/**
 * OMNIBET AI - META-AGGREGATOR (V50.5 "Unified Supreme Intelligence")
 * Orchestrates all supreme agents and fuses their results into a final verdict.
 */

export function aggregateSupremePrediction(baseResult, supremeAgents, match) {
    let finalHomeProb = baseResult.homeWinProb;
    let finalAwayProb = baseResult.awayWinProb;
    let finalDrawProb = baseResult.drawProb || 0;

    console.log('🌌 [Aggregator] Injected Agents:', Object.keys(supremeAgents));

    // 1. Bayesian Bridge Influence (Confidence Refinement)
    if (supremeAgents.bayesianBridge) {
        const bayesian = supremeAgents.bayesianBridge;
        // The bridge corrects biases found in H2H and Form
        finalHomeProb = (finalHomeProb * 0.7) + (bayesian.home * 0.3);
        finalAwayProb = (finalAwayProb * 0.7) + (bayesian.away * 0.3);
    }

    // 2. Vortex Force (Momentum & Energy)
    if (supremeAgents.vortexForce) {
        const force = supremeAgents.vortexForce.force / 50; // normalized around 1.0
        if (baseResult.winner === 'home') finalHomeProb *= force;
        else if (baseResult.winner === 'away') finalAwayProb *= force;
    }

    // 3. Market Sentiment (Sharp Money Penalty/Boost)
    if (supremeAgents.marketHeat) {
        const heat = supremeAgents.marketHeat;
        if (heat.level === 'critical') {
            // Dangerous market movement against the pick
            if (heat.direction !== baseResult.winner) {
                console.log('🔥 [Aggregator] SHARP MONEY COUNTER-PICK DETECTED. Applying penalty.');
                if (baseResult.winner === 'home') finalHomeProb *= 0.92;
                else finalAwayProb *= 0.92;
            } else {
                // Following the smart money
                if (baseResult.winner === 'home') finalHomeProb *= 1.05;
                else finalAwayProb *= 1.05;
            }
        }
    }

    // 4. Sentinel Sentiment Injection
    if (supremeAgents.sentinel) {
        const { home: hSent, away: aSent } = supremeAgents.sentinel;
        if (hSent?.scoreModifier) finalHomeProb += (hSent.scoreModifier * 5); // amplify news impact
        if (aSent?.scoreModifier) finalAwayProb += (aSent.scoreModifier * 5);
    }

    // --- FINAL RE-NORMALIZATION (Audit Math Corrected) ---
    const sport = match.sport?.toLowerCase();
    const isSoccer = sport === 'soccer' || sport === 'football';

    // We maintain the draw probability from the base model but allow slight shifts
    let targetDraw = isSoccer ? finalDrawProb : 0;
    let winSpace = 100 - targetDraw;

    const totalWinInput = finalHomeProb + finalAwayProb;
    let normalizedHome = Math.round((finalHomeProb / totalWinInput) * winSpace);
    let normalizedAway = Math.round((finalAwayProb / totalWinInput) * winSpace);
    let normalizedDraw = 100 - normalizedHome - normalizedAway;

    // Winner update
    let winner = 'draw';
    if (isSoccer) {
        // V60: Reduced draw bias. If Home or Away have a clear edge (> 5%), they take the win.
        if (normalizedHome > normalizedAway && normalizedHome > (normalizedDraw - 5)) winner = 'home';
        else if (normalizedAway > normalizedHome && normalizedAway > (normalizedDraw - 5)) winner = 'away';
        else winner = 'draw';
    } else {
        winner = normalizedHome > normalizedAway ? 'home' : 'away';
        normalizedDraw = 0;
    }

    const maxProb = Math.max(normalizedHome, normalizedAway, normalizedDraw);

    return {
        homeWinProb: normalizedHome,
        awayWinProb: normalizedAway,
        drawProb: normalizedDraw,
        winner,
        maxProb,
        confidence: maxProb > 70 ? 'diamond' : (maxProb > 55 ? 'gold' : 'silver'),
        status: 'SUPREME_VERDICT_UNIFIED'
    };
}
