
const fs = require('fs');

async function debugNBA() {
    try {
        // 1. Fetch Scoreboard to find a game
        console.log("Fetching NBA Scoreboard...");
        const scoreUrl = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';
        const scoreRes = await fetch(scoreUrl);
        const scoreData = await scoreRes.json();

        if (!scoreData.events || scoreData.events.length === 0) {
            console.log("No NBA events found.");
            return;
        }

        const event = scoreData.events[0];
        const matchId = event.id;
        console.log(`Found Event: ${event.name} (ID: ${matchId})`);

        // 2. Fetch Summary (Deep Data)
        console.log(`Fetching Summary for ${matchId}...`);
        const summaryUrl = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${matchId}`;
        const summaryRes = await fetch(summaryUrl);
        const summaryData = await summaryRes.json();

        // 3. Inspect Key Areas
        console.log("\n--- INSPECTION ---");

        // Standings
        console.log("Standings Path (data.standings):", JSON.stringify(summaryData.standings ? "Exists" : "Missing"));

        // H2H
        const h2h = summaryData.header?.competitions?.[0]?.headToHeadGames;
        console.log("H2H Games Found:", h2h?.length || 0);

        // Rosters / Boxscore
        console.log("Rosters (data.rosters):", summaryData.rosters ? `Exists (${summaryData.rosters.length})` : "Missing");
        console.log("Boxscore Players (data.boxscore.players):", summaryData.boxscore?.players ? `Exists (${summaryData.boxscore.players.length})` : "Missing");

        if (summaryData.boxscore?.players) {
            const team1 = summaryData.boxscore.players[0];
            console.log("Boxscore Team 1 Stats:", team1.statistics?.[0]?.athletes?.[0]);
        }

        // Save raw for analysis if needed
        fs.writeFileSync('debug_nba_raw.json', JSON.stringify(summaryData, null, 2));
        console.log("\nSaved raw JSON to debug_nba_raw.json");

    } catch (e) {
        console.error("Error:", e);
    }
}

debugNBA();
