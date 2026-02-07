/**
 * Market Shark Agent 🦈
 * "The Whale" - Analyzes betting patterns for "Smart Money"
 * USES REAL DATA ONLY (Odds vs Stat Probability)
 */

function oddsToProb(decimalOdds) {
    if (!decimalOdds || decimalOdds <= 1) return 0;
    return (1 / decimalOdds) * 100;
}

export function analyzeMarketMovement(currentOdds, openingOdds, calculatedProbabilities) {
    if (!currentOdds) return null;

    let signal = null;

    // SCENARIO 1: Real Opening Odds Available (Best Quality)
    if (openingOdds && openingOdds.home && currentOdds.home) {
        const homeDrop = currentOdds.home - openingOdds.home;
        const awayDrop = currentOdds.away - openingOdds.away;

        // Significant drop (e.g. 2.10 -> 1.80 is -0.30)
        if (homeDrop <= -0.15) {
            signal = { team: 'home', type: 'SHARP_MONEY', description: '🦈 Dinero Inteligente detectado en Local (Bajada de cuota)' };
        } else if (awayDrop <= -0.15) {
            signal = { team: 'away', type: 'SHARP_MONEY', description: '🦈 Dinero Inteligente detectado en Visita (Bajada de cuota)' };
        }

        // Drifting odds (Confidence lost)
        if (homeDrop >= 0.20) {
            signal = { team: 'away', type: 'DRIFT', description: '📉 Mercado perdiendo confianza en Local' };
        }
    }

    // SCENARIO 2: Value Discrepancy (Market vs Stats)
    // If Market gives Home 70% chance (1.42) but our Form Stats give only 40%
    // The market knows something we don't (Injuries? Motivation?). Respect the Market.
    else if (calculatedProbabilities) {
        const marketHomeProb = oddsToProb(currentOdds.home);
        const statHomeProb = calculatedProbabilities.homeFormProb; // Needs to be passed in

        if (marketHomeProb > 0 && statHomeProb > 0) {
            const diff = marketHomeProb - statHomeProb;

            if (diff > 20) {
                // Market is WAY more confident than stats support
                signal = {
                    team: 'home',
                    type: 'INSIDER_CONFIDENCE',
                    description: '🏛️ Respaldo de Mercado: Cuotas injustificadamente bajas (¿Información privilegiada?)'
                };
            }
        }
    }

    return signal;
}
