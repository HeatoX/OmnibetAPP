/**
 * VISUALS SERVICE
 * Enhances the app with high-quality images from TheSportsDB (Free Public API).
 * This is a "progressive enhancement" layer - if it fails, we just show generic icons.
 */

const BASE_URL = 'https://www.thesportsdb.com/api/v1/json/3'; // '3' is the public testing key

/**
 * Search for a player's cutout (transparent background photo)
 * @param {string} playerName 
 * @param {string} teamName (Optional, helps filter if common name)
 */
export async function getPlayerPhoto(playerName) {
    if (!playerName) return null;
    try {
        // TheSportsDB search is loose, usually first result is best known player
        const res = await fetch(`${BASE_URL}/searchplayers.php?p=${encodeURIComponent(playerName)}`);
        if (!res.ok) return null;

        const data = await res.json();
        if (data.player && data.player.length > 0) {
            // Prefer Cutout > Thumb > Render
            const p = data.player[0];
            return p.strCutout || p.strThumb || p.strRender || null;
        }
    } catch (e) {
        // Silent fail - visuals are not critical
    }
    return null;
}

/**
 * Search for a team's high-res badge
 * @param {string} teamName 
 */
export async function getTeamLogo(teamName) {
    if (!teamName) return null;
    try {
        const res = await fetch(`${BASE_URL}/searchteams.php?t=${encodeURIComponent(teamName)}`);
        if (!res.ok) return null;

        const data = await res.json();
        if (data.teams && data.teams.length > 0) {
            return data.teams[0].strTeamBadge || null;
        }
    } catch (e) {
        // Silent fail
    }
    return null;
}
/**
 * Fetch team trophies/honours
 * @param {string} teamName 
 */
export async function getTeamHonours(teamName) {
    if (!teamName) return [];
    try {
        // First get team ID
        const searchRes = await fetch(`${BASE_URL}/searchteams.php?t=${encodeURIComponent(teamName)}`);
        if (!searchRes.ok) return [];
        const searchData = await searchRes.json();

        if (searchData.teams && searchData.teams.length > 0) {
            const teamId = searchData.teams[0].idTeam;
            const res = await fetch(`${BASE_URL}/mhonours.php?id=${teamId}`);
            if (!res.ok) return [];
            const data = await res.json();
            return data.honours || [];
        }
    } catch (e) { }
    return [];
}
