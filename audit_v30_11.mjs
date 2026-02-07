import { getRealMatches } from './src/lib/real-data-service.js';
import fs from 'fs';

async function audit() {
    console.log("Starting Forensic Audit V30.11...");
    try {
        const data = await getRealMatches();
        console.log(`Audit Result: Found ${data.matches?.length || 0} matches.`);

        if (data.matches && data.matches.length > 0) {
            console.log("Sample Match:", JSON.stringify(data.matches[0], null, 2));
        } else {
            console.warn("CRITICAL: Zero matches found!");
        }

        // Check ELO Ratings file
        if (fs.existsSync('./data/elo_ratings.json')) {
            const elo = JSON.parse(fs.readFileSync('./data/elo_ratings.json', 'utf8'));
            console.log(`ELO File found. Teams: ${Object.keys(elo.ratings || {}).length}. Last trained: ${elo.lastTrained}`);
        } else {
            console.error("ELO File NOT found at ./data/elo_ratings.json");
        }
    } catch (e) {
        console.error("Audit Failure:", e);
    }
}

audit();
