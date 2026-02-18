// ========================================
// OmniBet AI - Strategy Director (The "CEO")
// Decides functionality and risk management
// ========================================

export class StrategyDirector {
    constructor() {
        this.role = 'CEO';
        this.riskProfile = 'Calculated'; // Could be 'Aggressive' or 'Conservative'
    }

    /**
     * Final decision on whether to publish a prediction and how to label it.
     */
    evaluate(prediction, confidenceScore) {
        if (!prediction) return { action: 'REJECT', reason: 'No prediction data' };

        // 1. Sanity Check
        if (confidenceScore < 40) {
            return {
                action: 'HOLD',
                reason: 'Confidence too low for public release',
                recommendation: 'Skip betting on this match'
            };
        }

        // 2. Value Assessment
        // If probability is high but odds are trash (e.g. 1.05), CEO might say "Not worth it"
        // For now, we assume we want to correct the "Tone" of the prediction.

        let strategicNote = "";
        const maxProb = prediction.maxProb || 0;

        if (maxProb > 75) {
            strategicNote = "High confidence play. Recommended for parlays.";
        } else if (maxProb > 55) {
            strategicNote = "Value play. Good risk/reward ratio.";
        } else {
            strategicNote = "Risky. Only for entertainment.";
        }

        return {
            action: 'PUBLISH',
            strategicNote,
            approvedBy: 'StrategyDirector (CEO)',
            timestamp: new Date().toISOString()
        };
    }
}
