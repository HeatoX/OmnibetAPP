
import { fetchESPNEndpoint } from './src/lib/real-data-service.js';

async function testNetwork() {
    console.log("🔍 Testing basic connectivity...");
    try {
        const google = await fetch('https://www.google.com');
        console.log(`✅ Google Reachable: ${google.status}`);
    } catch (e) {
        console.error("❌ Google Unreachable:", e.message);
    }

    console.log("\n🔍 Testing ESPN API endpoints...");

    const endpoints = [
        'scoreboard', // soccer/all
        'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard?limit=100&dates=20260216-20260219',
        'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard', // Base URL
        'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard'
    ];

    for (const ep of endpoints) {
        console.log(`\nTesting: ${ep}`);
        try {
            // we will manually fetch if it looks like a url, otherwise use the service function if possible
            // But since I can't easily import the complex service without running everything, 
            // I'll just rely on direct fetch for the specific URLs I know real-data-service uses.

            const url = ep.startsWith('http') ? ep : `https://site.api.espn.com/apis/site/v2/sports/soccer/all/${ep}`;

            console.log(`  -> GET ${url}`);
            const start = Date.now();
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'application/json'
                }
            });
            const duration = Date.now() - start;

            if (res.ok) {
                const data = await res.json();
                console.log(`  ✅ Success (${duration}ms) - Size: ${JSON.stringify(data).length} bytes`);
            } else {
                console.error(`  ⚠️ HTTP Error: ${res.status} ${res.statusText}`);
                const text = await res.text();
                console.error(`  Response: ${text.slice(0, 100)}...`);
            }
        } catch (e) {
            console.error(`  ❌ FETCH FAILED:`, e);
            if (e.cause) console.error("  Cause:", e.cause);
        }
    }
}

testNetwork();
