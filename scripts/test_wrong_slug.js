
async function testWrongSlug() {
    const matchId = '746900'; // Union vs Frankfurt

    // 1. Correct Slug
    const correctUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/summary?event=${matchId}`;
    console.log(`Testing Correct Slug (ger.1)...`);
    const cRes = await fetch(correctUrl);
    const cData = await cRes.json();
    console.log(`✅ Correct Form Length: ${cData.boxscore?.form?.length || 0}`);

    // 2. Wrong Slug (Default esp.1)
    const wrongUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/summary?event=${matchId}`;
    console.log(`Testing Wrong Slug (esp.1)...`);
    const wRes = await fetch(wrongUrl);
    const wData = await wRes.json();
    console.log(`❌ Wrong Form Length: ${wData.boxscore?.form?.length || 0}`);
}

testWrongSlug();
