
const https = require('https');

async function testEndpoint() {
    const url = 'https://site.api.espn.com/apis/site/v2/sports/soccer/all/teams/598/schedule';
    console.log(`Testing: ${url}`);

    https.get(url, (res) => {
        console.log(`Status Code: ${res.statusCode}`);
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                console.log(`Events Found: ${json.events ? json.events.length : 0}`);
                if (json.events && json.events.length > 0) {
                    console.log('Sample:', json.events[0].name);
                } else {
                    console.log('Response:', data.substring(0, 200));
                }
            } catch (e) {
                console.log('Not JSON:', data.substring(0, 200));
            }
        });
    }).on('error', (e) => {
        console.error('Network Error:', e);
    });
}

testEndpoint();
