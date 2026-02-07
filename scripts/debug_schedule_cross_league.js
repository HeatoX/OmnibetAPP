
async function debugSchedule() {
    const teamId = '598'; // Union Berlin

    // 1. Correct League (ger.1)
    const url1 = `https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/teams/${teamId}/schedule`;
    try {
        const res1 = await fetch(url1);
        const data1 = await res1.json();
        const events1 = data1.events?.filter(e => e.competitions?.[0]?.status?.type?.completed) || [];
        console.log(`✅ GER.1 Schedule Events: ${events1.length}`);
    } catch (e) { console.log("GER.1 Failed"); }

    // 2. Wrong League (esp.1)
    const url2 = `https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/teams/${teamId}/schedule`;
    try {
        const res2 = await fetch(url2);
        if (!res2.ok) {
            console.log(`❌ ESP.1 Schedule Failed: Status ${res2.status}`);
        } else {
            const data2 = await res2.json();
            const events2 = data2.events?.filter(e => e.competitions?.[0]?.status?.type?.completed) || [];
            console.log(`⚠️ ESP.1 Schedule Events: ${events2.length}`);
        }
    } catch (e) { console.log("ESP.1 Failed"); }
}

debugSchedule();
