// ========================================
// OmniBet AI - Quality Assurance (The "Reviewer")
// Audits predictions for logical errors before release.
// ========================================

export class QualityAssurance {
    constructor() {
        this.role = 'Reviewer';
    }

    /**
     * Audit a prediction for inconsistencies
     */
    audit(prediction) {
        const issues = [];
        const { homeWinProb, awayWinProb, drawProb, winner, maxProb } = prediction;

        // 1. Math Check (Probabilities should sum to ~100)
        const totalProb = (homeWinProb || 0) + (awayWinProb || 0) + (drawProb || 0);
        if (Math.abs(totalProb - 100) > 5) { // Allow slight rounding error margin
            issues.push(`Probabilities sum to ${totalProb}%, expected ~100%`);
        }

        // 2. Logic Check (Winner field matches highest probability)
        let calculatedWinner = 'draw';
        if (homeWinProb > awayWinProb && homeWinProb > drawProb) calculatedWinner = 'home';
        else if (awayWinProb > homeWinProb && awayWinProb > drawProb) calculatedWinner = 'away';

        if (winner !== calculatedWinner) {
            issues.push(`Winner mismatch: Claimed '${winner}' but highest prob is '${calculatedWinner}'`);
        }

        // 3. Hallucination Check (Probabilities cannot be 0 if match is valid)
        if (maxProb === 0) {
            issues.push('Invalid Max Probability (0%)');
        }

        return {
            passed: issues.length === 0,
            issues,
            score: 10 - issues.length // Simple QA score
        };
    }
}
