const https = require('https');

const ESPN_ENDPOINTS = {
    soccer: {
        laliga: 'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard',
        premier: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard',
        seriea: 'https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/scoreboard',
        bundesliga: 'https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/scoreboard',
        ligue1: 'https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/scoreboard',
    }
};

async function testLeagues() {
    const now = new Date();
    const nextTwoWeeks = new Date();
    nextTwoWeeks.setDate(now.getDate() + 14);
    const formatDate = (date) => date.toISOString().slice(0, 10).replace(/-/g, '');
    const dateRange = `${formatDate(now)}-${formatDate(nextTwoWeeks)}`;

    console.log(`Testing range: ${dateRange}`);

    for (const [name, url] of Object.entries(ESPN_ENDPOINTS.soccer)) {
        const fetchUrl = `${url}?limit=50&dates=${dateRange}`;
        console.log(`\n--- ${name} ---`);
        console.log(`URL: ${fetchUrl}`);

        try {
            const data = await new Promise((resolve, reject) => {
                https.get(fetchUrl, (res) => {
                    let body = '';
                    res.on('data', (chunk) => body += chunk);
                    res.on('end', () => resolve(JSON.parse(body)));
                    res.on('error', reject);
                });
            });

            const count = data.events ? data.events.length : 0;
            console.log(`Events found: ${count}`);
            if (count > 0) {
                data.events.slice(0, 3).forEach(e => {
                    console.log(`  - ${e.name} (${e.date})`);
                });
            }
        } catch (err) {
            console.error(`  Error: ${err.message}`);
        }
    }
}

testLeagues();
