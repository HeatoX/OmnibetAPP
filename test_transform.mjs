import { transformESPNData } from './src/lib/real-data-service.js';

async function test() {
    try {
        const url = 'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard';
        console.log(`Fetching ${url}...`);
        const res = await fetch(url);
        const data = await res.json();

        console.log(`Transforming ${data.events?.length || 0} events...`);
        const transformed = transformESPNData(data, 'soccer', 'LaLiga');

        console.log(`Success! Found ${transformed.length} matches.`);
        if (transformed.length > 0) {
            console.log('Sample match:', JSON.stringify(transformed[0], null, 2));
        }
    } catch (err) {
        console.error('Test failed:', err);
    }
}

test();
