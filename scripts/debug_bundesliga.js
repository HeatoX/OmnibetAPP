
const fs = require('fs');

async function debugBundesliga() {
    console.log("🔍 Starting Bundesliga Debug...");

    // 1. Fetch Scoreboard to find Union Berlin vs Frankfurt
    const scoreUrl = 'https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/scoreboard';
    console.log(`➡️ Fetching Scoreboard: ${scoreUrl}`);

    try {
        const res = await fetch(scoreUrl);
        const data = await res.json();
        const events = data.events || [];

        console.log(`✅ Found ${events.length} events.`);

        const match = events.find(e => {
            const name = e.name.toLowerCase();
            return name.includes('union') || name.includes('frankturt') || name.includes('frankfurt');
        });

        if (!match) {
            console.error("❌ Could not find Union Berlin vs Frankfurt match in upcoming list.");
            return;
        }

        console.log(`🎯 Found Match: ${match.name} (ID: ${match.id})`);

        // 2. Fetch Summary (Details)
        const summaryUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/summary?event=${match.id}`;
        console.log(`➡️ Fetching Summary: ${summaryUrl}`);

        const sumRes = await fetch(summaryUrl);
        const sumData = await sumRes.json();

        // 3. Inspect Form Data
        const boxscore = sumData.boxscore || {};
        const form = boxscore.form || [];
        console.log(`📊 Boxscore Form Length: ${form.length}`);

        if (form.length > 0) {
            console.log("   First Team Form Events:", form[0].events ? form[0].events.length : 0);
        } else {
            console.log("⚠️ Boxscore Form is EMPTY. Using fallback...");
        }

        // 4. Test Schedule Fallback (what fails in the app)
        const homeId = match.competitions[0].competitors[0].team.id;
        const homeName = match.competitions[0].competitors[0].team.name;

        console.log(`➡️ Testing Schedule Fallback for ${homeName} (ID: ${homeId})`);
        const scheduleUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/teams/${homeId}/schedule`;
        console.log(`   URL: ${scheduleUrl}`);

        const schedRes = await fetch(scheduleUrl);
        const schedData = await schedRes.json();
        const schedEvents = schedData.events || [];

        console.log(`   Events Found: ${schedEvents.length}`);
        const completed = schedEvents.filter(e => e.competitions?.[0]?.status?.type?.completed);
        console.log(`   Completed Events: ${completed.length}`);

        if (completed.length > 0) {
            console.log("✅ Fallback SHOULD work. Sample event:", JSON.stringify(completed[0].competitions[0].competitors, null, 2).substring(0, 200) + "...");
        } else {
            console.error("❌ Fallback query returned no completed games!");
        }

    } catch (error) {
        console.error("🔥 Error:", error);
    }
}

debugBundesliga();
