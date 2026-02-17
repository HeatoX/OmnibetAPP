/**
 * OmniBet AI - Raw Data Fetcher
 * Extracted from real-data-service.js to prevent circular dependencies.
 * Handles direct communication with ESPN APIs for specific event summaries.
 */

/**
 * FETCH DEEP MATCH STATS (Boxscore, Summary, Roster)
 * Target: https://site.api.espn.com/apis/site/v2/sports/{sport}/{league}/summary?event={matchId}
 */
export async function getMatchSummary(matchId, sport = 'soccer', league = 'eng.1') {
    try {
        // Normalize sport for URL
        const urlSport = sport === 'football' ? 'soccer' : sport;

        // ESPN API URL construction
        const url = `https://site.api.espn.com/apis/site/v2/sports/${urlSport}/${league}/summary?event=${matchId}`;

        console.log(`📡 Fetching Deep Summary (DataFetcher): ${url}`);

        const res = await fetch(url, { next: { revalidate: 300 } }); // 5 min cache
        if (!res.ok) {
            console.warn(`Fetch failed for ${url}: ${res.status}`);
            return null;
        }

        const data = await res.json();
        return data; // Returns the full deep data object
    } catch (e) {
        console.error("Match Summary Fetch Error:", e);
        return null;
    }
}
