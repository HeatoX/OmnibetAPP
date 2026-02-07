
async function testAllSlug() {
    const teamId = '598'; // Union Berlin
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/all/teams/${teamId}/schedule`;

    console.log(`Testing URL: ${url}`);

    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.log(`❌ Failed: ${res.status}`);
            return;
        }

        const data = await res.json();
        const events = data.events || [];
        console.log(`✅ Events Found via 'all': ${events.length}`);

        if (events.length > 0) {
            console.log('Sample Event:', events[0].name, events[0].date);
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

testAllSlug();
