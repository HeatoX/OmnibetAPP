
const fs = require('fs');

async function debugLorient() {
    try {
        console.log("Fetching Coupe de France Scoreboard...");
        const scoreUrl = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fra.coupe_de_france/scoreboard';
        const scoreRes = await fetch(scoreUrl);
        const scoreData = await scoreRes.json();

        // 1. Find Lorient vs Paris FC
        const event = scoreData.events?.find(e => e.name.includes('Lorient') || e.name.includes('Paris FC'));

        if (!event) {
            console.log("Lorient game not found in Scoreboard.");
            // Print available games
            console.log("Available:", scoreData.events?.map(e => e.name).join(', '));
            return;
        }

        console.log(`Found Event: ${event.name} (ID: ${event.id})`);
        const matchId = event.id;

        // 2. Fetch Summary
        const summaryUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/fra.coupe_de_france/summary?event=${matchId}`;
        const res = await fetch(summaryUrl);
        const data = await res.json();

        // 3. Inspect Team Data for League hints
        const homeTeam = data.header?.competitions?.[0]?.competitors?.[0]?.team;
        const awayTeam = data.header?.competitions?.[0]?.competitors?.[1]?.team;

        console.log("\n--- Home Team (Lorient?) Analysis ---");
        console.log("Name:", homeTeam.displayName);
        console.log("ID:", homeTeam.id);
        console.log("Links:", homeTeam.links?.map(l => l.href));

        // 4. Test Roster Fetch
        const cupSlug = 'fra.coupe_de_france'; // The match league
        console.log(`\nTesting fetch with Match Slug: '${cupSlug}'...`);
        const cupRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${cupSlug}/teams/${homeTeam.id}/roster`);
        console.log(`Status: ${cupRes.status}`);

        // 5. Test with Ligue 2 slug if hypothesis is correct
        const ligue2Slug = 'fra.2';
        console.log(`\nTesting fetch with Ligue 2 Slug: '${ligue2Slug}'...`);
        const l2Res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${ligue2Slug}/teams/${homeTeam.id}/roster`);
        console.log(`Status: ${l2Res.status}`);
        if (l2Res.ok) {
            const d = await l2Res.json();
            console.log("Athletes found:", d.athletes?.length);
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

debugLorient();
