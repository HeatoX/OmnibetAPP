/**
 * OPENLIGA SERVICE
 * Specialized data for German Bundesliga from openligadb.de
 */

export async function fetchGermanStats(league = 'bl1', season = '2025') {
    try {
        const url = `https://api.openligadb.de/getmatchdata/${league}/${season}`;
        const res = await fetch(url);
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.error('OpenLiga Error:', e);
        return null;
    }
}
