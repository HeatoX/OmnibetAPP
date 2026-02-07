const https = require('https');

function get(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
            });
        }).on('error', reject);
    });
}

async function run() {
    const url = 'https://site.api.espn.com/apis/site/v2/sports/tennis/atp/scoreboard';
    try {
        console.log(`Inspecting Tennis structure: ${url}`);
        const data = await get(url);
        if (data.events && data.events.length > 0) {
            const event = data.events[0];
            console.log(`Event Name: ${event.name}`);
            console.log(`Competitions length: ${event.competitions?.length}`);
            if (event.competitions && event.competitions[0]) {
                const comp = event.competitions[0];
                console.log(`Competitors count: ${comp.competitors?.length}`);
                if (comp.competitors) {
                    console.log('Competitor names:', comp.competitors.map(c => c.team?.name || c.team?.displayName));
                }
            }
        } else {
            console.log('No events found at root level.');
        }
    } catch (err) { console.log('Error:', err.message); }
}
run();
