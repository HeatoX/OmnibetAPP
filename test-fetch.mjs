
const { getRealMatches } = require('./src/lib/real-data-service');

// Mock fetch for Node environment if needed, but we can just run this if the environment supports fetch
// Since we are in a node environment, we might need a polyfill if node version is old, but typically it's fine in recent node.
// Actually, 'getRealMatches' uses 'fetch'.

/* 
   We will rely on the app running or assume we can run this snippet. 
   However, `src/lib/real-data-service` uses `export async function`. Node uses `require`. 
   This might be an ESM module.
*/

// Let's try to verify via the Application Logs if possible, or create a simple standalone script.
// I'll create a script that imports the service. Since it's likely ESM, I'll use .mjs

import { getRealMatches } from './src/lib/real-data-service.js';

async function testFetch() {
    console.log("Testing data fetch...");
    try {
        const matches = await getRealMatches();

        const bySport = {};
        matches.forEach(m => {
            bySport[m.sport] = (bySport[m.sport] || 0) + 1;
        });

        console.log("Matches found by sport:", bySport);

        const nba = matches.find(m => m.sport === 'basketball');
        if (nba) {
            console.log("Sample NBA Match:", nba.home.name, "vs", nba.away.name);
        } else {
            console.log("NO NBA MATCHES FOUND");
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

testFetch();
