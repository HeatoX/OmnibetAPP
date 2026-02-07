
const fs = require('fs');

async function debugLyon() {
    // Lyon ID: 160 (retrieved from previous debug context or assumed common ID)
    // Actually, I should find it dynamically to be safe.

    console.log("Locating Lyon Team ID...");
    const cupUrl = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fra.coupe_de_france/scoreboard?dates=20260204';
    const res = await fetch(cupUrl);
    const data = await res.json();

    const event = data.events?.find(e => e.name.toLowerCase().includes('lyon'));
    if (!event) {
        console.log("Lyon event not found. Exiting.");
        return;
    }

    console.log(`Event Found: ${event.name}`);
    const summaryUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/fra.coupe_de_france/summary?event=${event.id}`;
    const sRes = await fetch(summaryUrl);
    const sData = await sRes.json();

    // Find Lyon Team ID
    const team = sData.header?.competitions?.[0]?.competitors?.find(c => c.team?.displayName?.toLowerCase().includes('lyon'))?.team;
    if (!team) {
        console.log("Lyon team object not found in header.");
        return;
    }

    const teamId = team.id;
    console.log(`Lyon Team ID: ${teamId}`);

    // Simulate Smart Guess Logic
    const sport = 'soccer';
    const matchLeagueSlug = 'fra.coupe_de_france';

    console.log("\n--- Simulating Smart Guess ---");
    const prefix = matchLeagueSlug.split('.')[0];
    const candidates = [`${prefix}.1`, `${prefix}.2`, 'eng.1', 'esp.1', 'ita.1', 'ger.1', 'fra.1']; // Order matters?
    const uniqueCandidates = [...new Set(candidates)].filter(c => c !== matchLeagueSlug);

    console.log("Candidates:", uniqueCandidates);

    for (const guessSlug of uniqueCandidates) {
        process.stdout.write(`Testing ${guessSlug}... `);
        try {
            const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${guessSlug}/teams/${teamId}/roster`;
            const rRes = await fetch(url);
            console.log(rRes.status);
            if (rRes.ok) {
                const rData = await rRes.json();
                if (rData.athletes && rData.athletes.length > 0) {
                    console.log(`SUCCESS! Found ${rData.athletes.length} athletes.`);
                    console.log("Sample Athlete:", rData.athletes[0].displayName);
                    return;
                } else {
                    console.log("Empty athletes array.");
                }
            }
        } catch (e) {
            console.log("Error:", e.message);
        }
    }
    console.log("❌ Failed to find roster.");
}

debugLyon();
