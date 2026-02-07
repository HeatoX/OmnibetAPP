// Endpoints from real-data-service.js
const ENDPOINTS = {
    nba: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
    atp: 'https://site.api.espn.com/apis/site/v2/sports/tennis/atp/scoreboard',
    nfl: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard'
};

async function checkEndpoint(name, url) {
    try {
        console.log(`Checking ${name}...`);
        const res = await fetch(url);
        if (!res.ok) {
            console.log(`❌ ${name}: HTTP ${res.status}`);
            return;
        }
        const data = await res.json();
        const events = data.events || [];
        console.log(`✅ ${name}: Found ${events.length} events`);

        if (events.length > 0) {
            // Print one to see date
            const first = events[0];
            console.log(`   Sample: ${first.name} on ${first.date}`);
            console.log(`   Status: ${first.status?.type?.state}`);
        } else {
            // Debug why 0 events
            console.log(`   Detailed: League name is ${data.leagues?.[0]?.name}`);
            console.log(`   Season info: ${data.season?.year} type ${data.season?.type}`);
        }
    } catch (e) {
        console.log(`❌ ${name}: Error ${e.message}`);
    }
}

async function run() {
    await checkEndpoint('NBA', ENDPOINTS.nba);
    await checkEndpoint('ATP Tennis', ENDPOINTS.atp);
    await checkEndpoint('NFL', ENDPOINTS.nfl);
}

run();
