
// Native fetch is available in Node 18+

async function debugMetz() {
    console.log("🔍 Debugging Metz (Ligue 1)...");

    // 1. Find Match ID
    const sbUrl = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/scoreboard';
    const sbRes = await fetch(sbUrl);
    const sbData = await sbRes.json();

    // Look for Metz or Lille
    const match = sbData.events?.find(e => e.name.toLowerCase().includes('metz') || e.name.toLowerCase().includes('lille'));

    if (!match) {
        console.error("❌ Could not find Metz/Lille match in upcoming scoreboard.");
        // Try to guess a match ID if possible or fallback to generic test
        return;
    }

    console.log(`🎯 Found Match: ${match.name} (ID: ${match.id})`);

    // 2. Fetch Summary
    const sumUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/summary?event=${match.id}`;
    const sumRes = await fetch(sumUrl);
    const sumData = await sumRes.json();

    // 3. Check Header Slug
    const headerSlug = sumData.header?.league?.slug;
    console.log(`🏷️ Header Slug: '${headerSlug}'`);

    // 4. Check Boxscore Form
    const form = sumData.boxscore?.form;
    console.log(`📊 Boxscore Form Length: ${form?.length || 0}`);

    // 5. Test Fallback Schedule Fetch
    const homeId = match.competitions[0].competitors[0].team.id;
    const homeName = match.competitions[0].competitors[0].team.name;
    const slugToUse = headerSlug || 'fra.1';

    console.log(`🔄 Testing Schedule Fetch for ${homeName} (ID: ${homeId}) using slug '${slugToUse}'`);

    const schedUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/${slugToUse}/teams/${homeId}/schedule`;
    console.log(`   URL: ${schedUrl}`);

    const schedRes = await fetch(schedUrl);
    const schedData = await schedRes.json();

    const events = schedData.events || [];
    const completed = events.filter(e => e.competitions?.[0]?.status?.type?.completed);

    console.log(`✅ Schedule Events Found: ${events.length}`);
    console.log(`✅ Completed Events: ${completed.length}`);
}

debugMetz();
