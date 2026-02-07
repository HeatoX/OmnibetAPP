const https = require('https');

// Calculate date range
const now = new Date();
const nextWeek = new Date();
nextWeek.setDate(now.getDate() + 7);
const formatDate = (date) => date.toISOString().slice(0, 10).replace(/-/g, '');
const dateRange = `${formatDate(now)}-${formatDate(nextWeek)}`;

const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/eng.league_cup/scoreboard?limit=50&dates=${dateRange}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log(`Events found: ${json.events ? json.events.length : 0}`);

            if (json.events) {
                json.events.forEach(event => {
                    const competition = event.competitions[0];
                    const home = competition.competitors.find(c => c.homeAway === 'home').team.displayName;
                    const away = competition.competitors.find(c => c.homeAway === 'away').team.displayName;
                    const date = new Date(event.date);
                    const status = event.status.type.state;

                    const now = new Date();
                    const daysDiff = (date - now) / (1000 * 60 * 60 * 24);

                    let filteredReason = null;
                    if (status === 'post') filteredReason = 'Finished';
                    else if (daysDiff > 7) filteredReason = '> 7 Days';

                    console.log(`[${filteredReason ? 'FILTERED: ' + filteredReason : 'KEPT'}] ${home} vs ${away} | Date: ${event.date} | Status: ${status} | DaysDiff: ${daysDiff.toFixed(2)}`);
                });
            }
        } catch (e) {
            console.error(e);
        }
    });
}).on('error', (err) => {
    console.error("Error: " + err.message);
});
