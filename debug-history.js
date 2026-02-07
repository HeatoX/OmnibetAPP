
const https = require('https');

// Replicating getPastMatches logic
const daysBack = 3;
const end = new Date();
const start = new Date();
start.setDate(start.getDate() - daysBack);

const formatDate = (date) => date.toISOString().slice(0, 10).replace(/-/g, '');
const dateRange = `${formatDate(start)}-${formatDate(end)}`;

// Monitor Premier League as a test case
const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard?limit=100&dates=${dateRange}`;

console.log(`Checking URL: ${url}`);

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log(`Events found: ${json.events ? json.events.length : 0}`);

            if (json.events) {
                json.events.forEach(event => {
                    const statusStr = event.status.type.state;
                    const isFinished = statusStr === 'post';
                    const date = event.date;

                    console.log(`Match: ${event.name} | Date: ${date} | Status: ${statusStr} (${isFinished ? 'Finished' : 'Not finished'})`);

                    if (isFinished) {
                        console.log("  >>> THIS SHOULD BE INCLUDED IN HISTORY <<<");
                    } else {
                        console.log("  >>> Filtered out <<<");
                    }
                });
            } else {
                console.log("No events array in response.");
            }
        } catch (e) {
            console.error(e);
        }
    });
}).on('error', (err) => {
    console.error("Error: " + err.message);
});
