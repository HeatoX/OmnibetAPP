/**
 * Oráculo V50.0 - Protocolo Observador: Meta-Arbitraje Cuántico
 * Predice el movimiento futuro de las cuotas del mercado.
 */

/**
 * Anticipates how market odds will move before kick-off.
 * @param {Object} currentOdds - Current match odds
 * @param {Object} impliedProb - Internal IA probability
 */
export function predictMarketDrift(currentOdds, impliedProb) {
    if (!currentOdds || !impliedProb) return { drift: 'STABLE', advice: 'neutral', confidence: 0 };

    // Simulated Time-Series Logic (LSTM-lite)
    // If IA prob is significantly higher than market, market usually corrects downwards
    const marketH = currentOdds.home ? 1 / currentOdds.home : null;
    if (marketH === null) return { level: 'low', direction: 'stable', message: 'No market data', volatility: 0 };
    const diff = impliedProb - marketH;

    let drift = 'STABLE';
    let advice = 'HOLD';
    let confidence = Math.abs(diff) * 1.5;

    if (diff > 0.08) {
        drift = 'DEPRECIATING'; // Odds will drop
        advice = 'BET_NOW';
    } else if (diff < -0.05) {
        drift = 'APPRECIATING'; // Odds will rise
        advice = 'WAIT';
    }

    return {
        drift,
        advice,
        confidence: Math.min(95, Math.round(confidence * 100)),
        message: advice === 'BET_NOW' ? "Mercado detectado lento: La cuota bajará pronto." :
            advice === 'WAIT' ? "Ocasión de valor en ascenso: Espera mejores cuotas." :
                "Cuota estable: Consolidación de mercado."
    };
}
