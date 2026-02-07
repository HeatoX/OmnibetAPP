
const fs = require('fs');

async function locateLorient() {
    try {
        console.log("Searching for Lorient match...");

        // Try to find Lorient in Ligue 2 (fra.2) scoreboard or broader dates
        // Often cup matches appear in league scoreboard or generic one

        // 1. Broad Search: Ligue 2 (Lorient's league)
        const l2Url = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fra.2/scoreboard?dates=20260204'; // Screenshot says 4 Feb
        const l2Res = await fetch(l2Url);
        const l2Data = await l2Res.json();

        // 2. Search in generic Cup scoreboard for tomorrow
        const cupUrl = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fra.coupe_de_france/scoreboard?dates=20260204';
        const cupRes = await fetch(cupUrl);
        const cupData = await cupRes.json();

        const allEvents = [...(l2Data.events || []), ...(cupData.events || [])];
        const event = allEvents.find(e => e.name.toLowerCase().includes('lorient'));

        if (!event) {
            console.log("Still not found. Trying generic soccer scoreboard...");
            // return; 
        } else {
            console.log(`Found Event: ${event.name} (ID: ${event.id})`);
            await checkRoster(event.id);
            return;
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

async function checkRoster(matchId) {
    // 2. Fetch Summary
    const summaryUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/fra.coupe_de_france/summary?event=${matchId}`;
    const res = await fetch(summaryUrl);
    const data = await res.json();

    const homeTeam = data.header?.competitions?.[0]?.competitors?.[0]?.team;
    if (!homeTeam) {
        console.log("No home team in summary");
        return;
    }

    console.log("\n--- Team Analysis ---");
    console.log("Name:", homeTeam.displayName);
    console.log("ID:", homeTeam.id);

    // Check for League Links
    const leagueLink = homeTeam.links?.find(l => l.href.includes('/league/'));
    console.log("League Link detected:", leagueLink?.href || "None");

    // 4. Test Roster Fetch with Match Slug
    const cupSlug = 'fra.coupe_de_france';
    console.log(`\nTesting 'fra.coupe_de_france' (Cup)...`);
    const cupRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${cupSlug}/teams/${homeTeam.id}/roster`);
    console.log(`Status: ${cupRes.status}`);

    // 5. Test with Ligue 2 slug 
    const ligue2Slug = 'fra.2';
    console.log(`\nTesting 'fra.2' (Ligue 2)...`);
    const l2Res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${ligue2Slug}/teams/${homeTeam.id}/roster`);
    console.log(`Status: ${l2Res.status}`);

    if (l2Res.ok) {
        const d = await l2Res.json();
        console.log("Athletes in fra.2:", d.athletes?.length);
    }
}

locateLorient();
