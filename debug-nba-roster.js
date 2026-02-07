
const fs = require('fs');

async function debugRoster() {
    try {
        const teamId = '8'; // Pistons
        console.log(`Fetching Roster for Team ${teamId}...`);

        // Hypothetical Endpoint based on ESPN pattern
        // https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/8/roster
        const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${teamId}/roster`;

        const res = await fetch(url);
        if (!res.ok) {
            console.log(`Failed to fetch: ${res.status}`);
            return;
        }

        const data = await res.json();
        console.log("Roster Data Found!");
        console.log("Athletes count:", data.athletes?.length);

        if (data.athletes && data.athletes.length > 0) {
            const player = data.athletes[0];
            console.log("Sample Player:", player.displayName);
            console.log("Stats available?", player.statsSummary ? "Yes" : "No");
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

debugRoster();
