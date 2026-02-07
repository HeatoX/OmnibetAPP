/**
 * Morale Monitor Agent 🎭
 * "The Psychologist" - Analyzes team form and pressure
 * USES REAL DATA ONLY (Streaks, League Position, Elite Expectations)
 */

// Teams expected to always be in Top 4
const ELITE_TEAMS = [
    'Manchester City', 'Arsenal', 'Liverpool', 'Real Madrid', 'Barcelona',
    'Bayern Munich', 'PSG', 'Inter Milan', 'Juventus', 'Napoli'
];

export function analyzeMorale(teamForm, teamName) {
    let moraleScore = 50; // Neutral start
    let status = 'Stable';

    if (!teamForm || !teamForm.found) {
        return { score: 50, status: 'Unknown', impact: 0 };
    }

    const { streak, position, winRate } = teamForm;
    const isElite = ELITE_TEAMS.some(t => teamName?.includes(t));

    // 1. Streak Analysis (The most immediate morale indicator)
    if (streak) {
        if (streak.includes('W3')) { moraleScore += 15; status = 'High Confidence 🔥'; }
        else if (streak.includes('W5')) { moraleScore += 25; status = 'Unstoppable 🚀'; }
        else if (streak.includes('L3')) { moraleScore -= 15; status = 'Crisis Mode 📉'; }
        else if (streak.includes('L5')) { moraleScore -= 25; status = 'Freefall 💀'; }
        else if (streak.includes('D3')) { moraleScore -= 5; status = 'Frustrated 😐'; }
    }

    // 2. League Position Pressure
    // If an Elite team is outside Top 6, they are under massive pressure
    if (isElite && position > 6) {
        moraleScore -= 10;
        status = 'Under Pressure 💣'; // Overrides streak unless winning

        // If elite team is losing AND low rank, it's a disaster
        if (streak?.includes('L')) {
            status = 'Coach Sacking Risk 🪓';
            moraleScore -= 20;
        }
    }

    // 3. Relegation Panic (Low rank + Losing streak)
    // Assuming > 16th is danger zone in 20-team leagues
    if (position >= 17 && streak?.includes('L')) {
        moraleScore -= 10;
        status = 'Relegation Panic 😨';
    }

    // Normalize Impact (-10 to +10 roughly)
    const impact = Math.round((moraleScore - 50) / 2.5);

    return {
        score: moraleScore,
        impact,
        status
    };
}
