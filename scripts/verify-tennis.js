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

function transformESPNData(data) {
    if (!data.events || !Array.isArray(data.events)) return [];

    return data.events.flatMap(event => {
        let competitions = event.competitions;
        if ((!competitions || competitions.length === 0) && event.groupings) {
            competitions = event.groupings.flatMap(g => g.competitions || []);
        }

        if (!competitions || !Array.isArray(competitions)) return [];

        return competitions.map(competition => {
            const homeTeam = competition.competitors?.find(c => c.homeAway === 'home');
            const awayTeam = competition.competitors?.find(c => c.homeAway === 'away');
            if (!homeTeam || !awayTeam) return null;

            return {
                match: `${homeTeam.athlete?.displayName || homeTeam.team?.displayName} vs ${awayTeam.athlete?.displayName || awayTeam.team?.displayName}`,
                date: competition.date
            };
        }).filter(Boolean);
    }).filter(Boolean);
}

async function run() {
    const url = 'https://site.api.espn.com/apis/site/v2/sports/tennis/atp/scoreboard';
    try {
        console.log(`Verifying Tennis Extraction: ${url}`);
        const data = await get(url);
        const matches = transformESPNData(data);
        console.log(`✅ Success: Found ${matches.length} matches`);
        if (matches.length > 0) {
            console.log('Sample matches:');
            matches.slice(0, 3).forEach(m => console.log(` - ${m.match} (${m.date})`));
        }
    } catch (err) { console.log('❌ Error:', err.message); }
}
run();
