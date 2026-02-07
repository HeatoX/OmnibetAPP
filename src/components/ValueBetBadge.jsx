'use client';

/**
 * Value Bet Badge Component
 * Shows when our probability estimate suggests positive expected value
 */
export default function ValueBetBadge({ probability, odds, size = 'normal' }) {
    if (!probability || !odds) return null;

    // Calculate expected value
    // EV = (Probability * (Odds - 1)) - (1 - Probability)
    const decimalOdds = parseFloat(odds) || 1;
    const prob = probability / 100;
    const ev = (prob * (decimalOdds - 1)) - (1 - prob);
    const evPercent = (ev * 100).toFixed(1);

    // Only show if EV > 5% (significant edge)
    if (ev < 0.05) return null;

    const sizeClasses = {
        small: 'text-xs px-2 py-0.5',
        normal: 'text-sm px-3 py-1',
        large: 'text-base px-4 py-2'
    };

    return (
        <div
            className={`inline-flex items-center gap-1 rounded-full font-bold
                        bg-gradient-to-r from-emerald-500 to-green-400 
                        text-black animate-pulse ${sizeClasses[size]}`}
            title={`Expected Value: +${evPercent}%. This bet has a mathematical edge based on our probability model vs the bookmaker odds.`}
        >
            <span className="text-lg">💎</span>
            <span>VALOR +{evPercent}%</span>
        </div>
    );
}

/**
 * Calculate Expected Value
 * @param {number} probability - Our estimated probability (0-100)
 * @param {number|string} odds - Decimal odds from bookmaker
 * @returns {object} { ev: number, isValue: boolean, evPercent: string }
 */
export function calculateExpectedValue(probability, odds) {
    const decimalOdds = parseFloat(odds) || 1;
    const prob = probability / 100;
    const ev = (prob * (decimalOdds - 1)) - (1 - prob);

    return {
        ev,
        isValue: ev > 0.05,
        evPercent: (ev * 100).toFixed(1)
    };
}
