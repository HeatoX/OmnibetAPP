
const fs = require('fs');

async function debugCupData() {
    try {
        console.log("Searching for Holstein Kiel vs Stuttgart...");

        // 1. Locate Match
        // Use generic date search or try to find it by ID if known. 
        // Or search Bundesliga Scoreboard/Cup Scoreboard
        // Assuming user screenshot is "Upcoming" or "Live" or "Recent"
        // Let's search broadly in DFB Pokal

        // Note: DFB Pokal slug is 'ger.dfb_pokal'
        const url = 'https://site.api.espn.com/apis/site/v2/sports/soccer/ger.dfb_pokal/scoreboard';
        const res = await fetch(url);
        const data = await res.json();

        const event = data.events?.find(e => e.name.includes('Stuttgart') || e.name.includes('Holstein'));

        if (!event) {
            console.log("Match not found in standard scoreboard. Trying specific date (tomorrow/4th Feb as per screenshot)...");
            const res2 = await fetch(url + '?dates=20260204');
            const data2 = await res2.json();
            const event2 = data2.events?.find(e => e.name.includes('Stuttgart') || e.name.includes('Holstein'));
            if (event2) {
                await checkData(event2.id);
            } else {
                console.log("Still not found.");
            }
            return;
        }

        console.log(`Found Event: ${event.name} (ID: ${event.id})`);
        await checkData(event.id);

    } catch (e) {
        console.error("Error:", e);
    }
}

async function checkData(matchId) {
    const summaryUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/ger.dfb_pokal/summary?event=${matchId}`;
    const res = await fetch(summaryUrl);
    const data = await res.json();

    console.log("\n--- Data Inspection ---");

    // 1. Check Boxscore Teams (Source of Form)
    const boxTeams = data.boxscore?.teams;
    console.log("Boxscore Teams:", boxTeams ? boxTeams.length : "Missing");
    if (boxTeams) {
        boxTeams.forEach(t => {
            console.log(`Team: ${t.team?.displayName} - Events: ${t.events?.length || 0}`);
        });
    }

    // 2. Check Standings
    const standings = data.standings?.groups?.[0]?.standings?.entries || data.standings?.entries;
    console.log("Standings:", standings ? `Present (${standings.length})` : "Missing/Empty in Summary");

    // 3. Test Schedule Fetch (Fallback for Form)
    const homeId = data.header?.competitions?.[0]?.competitors?.[0]?.team?.id;
    console.log(`\nTesting Schedule Fetch for Home Team (${homeId})...`);
    // Schedule endpoint: .../teams/{id}/schedule
    const schedUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/ger.dfb_pokal/teams/${homeId}/schedule`;
    const sRes = await fetch(schedUrl);
    console.log(`Schedule Status: ${sRes.status}`);
    if (sRes.ok) {
        const sData = await sRes.json();
        console.log("Events found in schedule:", sData.events?.length);
        // Check if getting schedule from "ger.dfb_pokal" returns ALL games or just Cup games?
        // Usually it adheres to the league slug.
    }

    // Test Schedule from "ger.1" (Bundesliga)
    console.log(`Testing Schedule Fetch from 'ger.1' (Bundesliga)...`);
    const sRes2 = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/teams/${homeId}/schedule`);
    if (sRes2.ok) {
        const sData2 = await sRes2.json();
        console.log("Events found in Bundesliga schedule:", sData2.events?.length);
    }
}

debugCupData();
