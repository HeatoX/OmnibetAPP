const https = require('https');
const fs = require('fs');

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
        const data = await get(url);
        if (data.events && data.events.length > 0) {
            console.log('Writing Tennis event JSON to C:/Users/PABLO/.gemini/antigravity/scratch/omnibet-ai/scripts/tennis_event.json');
            fs.writeFileSync('C:/Users/PABLO/.gemini/antigravity/scratch/omnibet-ai/scripts/tennis_event.json', JSON.stringify(data.events[0], null, 2));
        } else {
            console.log('No events found.');
        }
    } catch (err) { console.log('Error:', err.message); }
}
run();
