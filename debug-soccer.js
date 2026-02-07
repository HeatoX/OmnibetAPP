
const fs = require('fs');

async function debugSoccer() {
    try {
        // 1. Fetch Scoreboard for Coupe de France to find a game
        console.log("Fetching Coupe de France Scoreboard...");
        const scoreUrl = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fra.coupe_de_france/scoreboard';
        const scoreRes = await fetch(scoreUrl);
        const scoreData = await scoreRes.json();

        if (!scoreData.events || scoreData.events.length === 0) {
            console.log("No Coupe de France events found. Trying Ligue 1...");
            // Fallback to Ligue 1 if no Cup games
            const l1Url = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/scoreboard';
            const l1Res = await fetch(l1Url);
            const l1Data = await l1Res.json();
            if (!l1Data.events || l1Data.events.length === 0) {
                console.log("No Ligue 1 events either.");
                return;
            }
            scoreData.events = l1Data.events;
        }

        const event = scoreData.events[0];
        const matchId = event.id;
        console.log(`Found Event: ${event.name} (ID: ${matchId})`);

        // 2. Fetch Summary
        console.log(`Fetching Summary for ${matchId}...`);
        // Note: Using generic soccer/fra.1 might work, but let's see what the event says
        const summaryUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/summary?event=${matchId}`;
        // We generally use generic endpoint in app, let's see if that works

        const summaryRes = await fetch(summaryUrl);
        const summaryData = await summaryRes.json();

        // 3. Inspect
        console.log("\n--- INSPECTION ---");

        // League Slug Info?
        const league = summaryData.header?.league;
        console.log("League Slug in Header:", league?.slug);

        // Rosters
        console.log("Rosters (data.rosters):", summaryData.rosters ? `Exists (${summaryData.rosters.length})` : "Missing");

        // Team IDs
        const homeId = summaryData.header?.competitions?.[0]?.competitors?.[0]?.team?.id;
        console.log("Home Team ID:", homeId);

        // Test Roster Fetch with 'esp.1' (Current Default)
        console.log("\nTesting 'esp.1' Roster Fetch...");
        const resEsp = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/teams/${homeId}/roster`);
        console.log("esp.1 Status:", resEsp.status);

        // Test Roster Fetch with correct slug (e.g. fra.1 or fra.coupe_de_france)
        if (league?.slug) {
            console.log(`\nTesting '${league.slug}' Roster Fetch...`);
            const resReal = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${league.slug}/teams/${homeId}/roster`);
            console.log(`${league.slug} Status:`, resReal.status);
            if (resReal.ok) {
                const d = await resReal.json();
                console.log("Athletes found:", d.athletes?.length);
            }
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

debugSoccer();
