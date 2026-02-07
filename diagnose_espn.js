const fetch = Object.assign(
    (url, opts) => import('node-fetch').then(({ default: fetch }) => fetch(url, opts)),
    {}
);

async function diagnose() {
    const url = 'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard';
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const dayAfter = new Date(now);
    dayAfter.setDate(now.getDate() + 2);

    const formatDate = (date) => date.toISOString().slice(0, 10).replace(/-/g, '');
    const dateRange = `${formatDate(yesterday)}-${formatDate(dayAfter)}`;
    const fetchUrl = `${url}?limit=50&dates=${dateRange}`;

    console.log(`Diagnosing URL: ${fetchUrl}`);

    try {
        const response = await fetch(fetchUrl, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        console.log(`Status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            console.error('Fetch failed');
            return;
        }

        const data = await response.json();
        console.log(`Events found: ${data.events?.length || 0}`);

        if (data.events && data.events.length > 0) {
            data.events.forEach(event => {
                console.log(`- Event: ${event.name} (${event.date}) - Status: ${event.status?.type?.state}`);
            });
        } else {
            console.log('No events in the payload.');
        }

    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

diagnose();
