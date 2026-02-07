const https = require('https');

function get(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`Failed to parse JSON: ${e.message}`));
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function testEndpoint(url) {
    try {
        console.log(`Testing: ${url}`);
        const data = await get(url);
        const count = data.events ? data.events.length : 0;
        console.log(`✅ Success: ${count} events found`);
        if (count > 0) {
            console.log(`   Sample event: ${data.events[0].name}`);
        } else {
            console.log(`   (No events for this date range)`);
        }
    } catch (err) {
        console.log(`❌ Error: ${err.message}`);
    }
}

const now = new Date();
const nextTwoWeeks = new Date();
nextTwoWeeks.setDate(now.getDate() + 14);

const formatDate = (date) => date.toISOString().slice(0, 10).replace(/-/g, '');
const dateRange = `${formatDate(now)}-${formatDate(nextTwoWeeks)}`;

async function run() {
    const urls = [
        `https://site.api.espn.com/apis/site/v2/sports/tennis/atp/scoreboard?limit=50&dates=${dateRange}`,
        `https://site.api.espn.com/apis/site/v2/sports/tennis/wta/scoreboard?limit=50&dates=${dateRange}`,
        `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard?limit=50&dates=${dateRange}`,
        `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?limit=50&dates=${dateRange}`
    ];

    for (const url of urls) {
        await testEndpoint(url);
    }
}

run();
