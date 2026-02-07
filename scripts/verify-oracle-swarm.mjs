/**
 * TEST: Oracle v2.0 REAL DATA Verification
 * Verifies strict logic paths (No Randomness)
 * Run with: node scripts/verify-oracle-swarm.mjs
 */

import { analyzeMatchDeep } from '../src/lib/prediction-oracle.js';

// SCENARIO 1: The "Crisis" Match
// Elite team (Real Madrid) on a losing streak
const MOCK_CRISIS_MATCH = {
    id: 'test-crisis-1',
    home: { name: 'Real Madrid' },
    away: { name: 'Osasuna' },
    venue: 'Santiago Bernabéu',
    date: new Date().toISOString(),
    referee: 'Mateu Lahoz',
    odds: { home: 1.5, away: 6.0, draw: 4.5 }, // Market still trusts them
    openingOdds: { home: 1.5, away: 6.0, draw: 4.5 },
    league: 'LaLiga',
    // Injecting Mock FORM data directly to test Morale Logic
    homeForm: { found: true, wins: 2, losses: 3, streak: 'L3', position: 5, winRate: 40 }, // Crisis!
    awayForm: { found: true, wins: 3, losses: 1, streak: 'W2', position: 8, winRate: 60 }
};

// SCENARIO 2: The "Insider" Match
// Stats say 50/50, but Market says Home wins easily
const MOCK_INSIDER_MATCH = {
    id: 'test-insider-1',
    home: { name: 'Team A' },
    away: { name: 'Team B' },
    venue: 'Generic Stadium',
    date: new Date().toISOString(),
    referee: 'Generic Ref',
    odds: { home: 1.3, away: 8.0, draw: 5.0 }, // 76% Implied Win Prob
    openingOdds: null,
    league: 'Premier League',
    homeForm: { found: true, wins: 2, losses: 2, winRate: 50 }, // 50% Win Rate
    awayForm: { found: true, wins: 2, losses: 2, winRate: 50 }  // 50% Win Rate
};

async function testOracleReal() {
    console.log('🤖 VERIFYING REAL-DATA ORACLE LOGIC...');
    console.log('-----------------------------------');

    // TEST 1: MORALE & CRISIS
    console.log('\n🧪 TEST 1: Elite Team Crisis (Real Madrid L3)');
    const res1 = await analyzeMatchDeep(MOCK_CRISIS_MATCH);
    const insights1 = res1.prediction?.swarmInsights || [];
    console.log('Context Insights:', insights1);

    const crisisDetected = insights1.some(i => i.includes('Crisis') || i.includes('Pressure'));
    if (crisisDetected) console.log('✅ PASS: Crisis/Pressure detected correctly.');
    else console.error('❌ FAIL: Crisis not detected for Elite team on losing streak.');

    // TEST 2: MARKET INSIDER
    console.log('\n🧪 TEST 2: Market vs Stats Discrepancy');
    const res2 = await analyzeMatchDeep(MOCK_INSIDER_MATCH);
    const insights2 = res2.prediction?.swarmInsights || [];
    console.log('Context Insights:', insights2);

    const insiderDetected = insights2.some(i => i.includes('Respaldo de Mercado') || i.includes('INSIDER'));
    if (insiderDetected) console.log('✅ PASS: Market discrepancy detected.');
    else console.error('❌ FAIL: Significant market/stat divergence ignored.');
}

testOracleReal();
