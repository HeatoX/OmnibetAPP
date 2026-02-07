
import { calculatePrediction } from '../src/lib/ai-engine.js';

// Mock Data
const mockMatch = {
    sport: 'football',
    home: { name: 'Real Madrid', id: '1' },
    away: { name: 'Barcelona', id: '2' },
};

const mockAnalysis = {
    homeForm: { recentGames: [{ score: '2-1' }, { score: '3-0' }, { score: '1-1' }] }, // Avg Scored: 2, Conceded: 0.66
    awayForm: { recentGames: [{ score: '1-0' }, { score: '2-2' }, { score: '0-1' }] }, // Avg Scored: 1, Conceded: 1
    h2h: [],
};

console.log("--- TEST 1: Football xG Logic ---");
const result = calculatePrediction(mockMatch, mockAnalysis);
console.log("Winner:", result.winner);
console.log("Confidence:", result.confidence);
console.log("Projected Total:", result.projectedTotal);
console.log("Detailed Analysis V16:");
console.log(JSON.stringify(result.detailedAnalysis, null, 2));

if (result.detailedAnalysis.some(a => a.content.includes("xG"))) {
    console.log("✅ Analysis contains xG data.");
} else {
    console.error("❌ Analysis missing xG data.");
}

console.log("\n--- TEST 2: Basketball Efficiency Logic ---");
const basketMatch = { ...mockMatch, sport: 'basketball' };
// Basket mock stats needs parsing (score '110-100')
const basketAnalysis = {
    homeForm: { recentGames: [{ score: '120-110' }, { score: '115-105' }] }, // Avg Vol: 117.5
    awayForm: { recentGames: [{ score: '100-90' }, { score: '105-95' }] }, // Avg Vol: 102.5
};

const basketResult = calculatePrediction(basketMatch, basketAnalysis);
console.log("Basket Projected Total:", basketResult.projectedTotal);
console.log("Basket Details:", JSON.stringify(basketResult.detailedAnalysis, null, 2));

if (basketResult.projectedTotal > 210) {
    console.log("✅ Projected Total seems correct for Basket.");
}
