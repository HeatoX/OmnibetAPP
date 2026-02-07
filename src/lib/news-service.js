/**
 * NEWS SERVICE
 * Fetches latest sports headlines from public RSS feeds or APIs.
 */

// We use a CORS Proxy for RSS feeds in a client-side environment
const RSS_FEEDS = [
    { name: 'ESPN', url: 'https://www.espn.com/espn/rss/news' },
    { name: 'BBC Sports', url: 'https://api.allorigins.win/raw?url=https://push.api.bbci.co.uk/pips/service/sport/news/rss.xml' },
    { name: 'Sky Sports', url: 'https://www.skysports.com/rss/12040' }
];

export async function fetchLatestNews() {
    try {
        const endpoints = [
            { name: 'Premier League', url: 'http://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/news?lang=es&region=es' },
            { name: 'La Liga', url: 'http://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/news?lang=es&region=es' },
            { name: 'NBA', url: 'http://site.api.espn.com/apis/site/v2/sports/basketball/nba/news?lang=es&region=es' }
        ];

        const results = await Promise.all(endpoints.map(async (ep) => {
            try {
                const res = await fetch(ep.url, { cache: 'no-store' });
                if (!res.ok) return [];
                const data = await res.json();
                return (data.articles || []).map(a => ({
                    id: a.id,
                    title: a.headline,
                    source: ep.name,
                    time: 'Ahora'
                }));
            } catch (e) { return []; }
        }));

        const allNews = results.flat();
        return allNews.sort(() => Math.random() - 0.5).slice(0, 15);
    } catch (error) {
        console.error('News Service Error:', error);
        return [];
    }
}
