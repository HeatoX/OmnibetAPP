
import { MasterOrchestrator } from './src/lib/agents/orchestrator.js';

const orchestrator = new MasterOrchestrator();

const mockMatch = {
    matchId: 'debug_test_01',
    sport: 'soccer',
    league: 'eng.1', // Premier League
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    venue: { name: 'Emirates Stadium', city: 'London' }
};

console.log("🚀 Starting Orchestrator Debug...");

try {
    const result = await orchestrator.analyzeMatch(mockMatch);
    console.log("✅ Diagnosis Success!");
    console.log(JSON.stringify(result, null, 2));
} catch (error) {
    console.error("❌ Diagnosis Failed:");
    console.error(error);
}
