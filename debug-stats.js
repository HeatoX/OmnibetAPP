
const fs = require('fs');

async function debugStats() {
    console.log("--- Debugging Player Stats ---");

    // 1. Check NBA Stats (Timberwolves - ID: 16)
    try {
        console.log("\nFetching NBA Roster (Timberwolves)...");
        const nbaUrl = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/16/roster';
        const nbaRes = await fetch(nbaUrl);
        const nbaData = await nbaRes.json();
        const player = nbaData.athletes?.[0];
        if (player) {
            console.log(`NBA Player: ${player.displayName}`);
            console.log("Stats Object:", JSON.stringify(player.statsSummary || player.stats || "Missing", null, 2));
        }
    } catch (e) { console.error("NBA Error:", e.message); }

    // 2. Check Soccer Stats (Lyon - ID: 160)
    try {
        console.log("\nFetching Soccer Roster (Lyon - fra.1)...");
        const socUrl = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/teams/160/roster';
        const socRes = await fetch(socUrl);
        const socData = await socRes.json();
        const sPlayer = socData.athletes?.[0];
        if (sPlayer) {
            console.log(`Soccer Player: ${sPlayer.displayName}`);
            console.log("Stats Object:", JSON.stringify(sPlayer.statsSummary || sPlayer.stats || "Missing", null, 2));
        }
    } catch (e) { console.error("Soccer Error:", e.message); }
}

debugStats();
