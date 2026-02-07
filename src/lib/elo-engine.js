/**
 * OMNIBET AI - ELO RATING ENGINE (V19 DEEP SOURCE)
 * 
 * "The Hidden Gem": A pure mathematical engine to calculate precise Team Power Ratings.
 * Eliminates simulation/randomness by deriving probability strictly from historical performance.
 * 
 * Logic:
 * 1. Teams start at 1500 ELO.
 * 2. Ratings update after every finished match using standard formula: R' = R + K * (Actual - Expected).
 * 3. K-Factor is dynamic (Margin of Victory Multiplier) for "Winning Edge".
 */

// Initial rating for all teams
const BASE_ELO = 1500;
const K_FACTOR_BASE = 32;

// V30.8: Persistent Brain Metadata
let lastTrainedTimestamp = 0;
export const TRAINING_COOLDOWN = 6 * 60 * 60 * 1000; // 6 Hours

export function isEloTrainingNeeded() {
    const now = Date.now();
    return (now - lastTrainedTimestamp >= TRAINING_COOLDOWN) || teamRatings.size === 0;
}

// V30.5: Safe Environment Detection (Browser vs Server)
const isServer = typeof window === 'undefined';
let teamRatings = new Map();

/**
 * Persist ratings to disk (Server-Only)
 */
export async function saveRatings() {
    if (!isServer) return;
    try {
        const fs = eval('require("fs")');
        const path = eval('require("path")');
        const STORAGE_PATH = path.join(process.cwd(), 'data', 'elo_ratings.json');

        // Ensure directory exists
        const dataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        const payload = {
            lastTrained: lastTrainedTimestamp,
            ratings: Object.fromEntries(teamRatings)
        };

        fs.writeFileSync(STORAGE_PATH, JSON.stringify(payload, null, 2));
        console.log("💾 ELO ratings persisted to disk.");
    } catch (e) {
        console.error("Error saving ratings:", e);
    }
}

/**
 * Load ratings from disk (Server-Only)
 */
export async function loadRatings() {
    if (!isServer) return;
    try {
        const fs = eval('require("fs")');
        const path = eval('require("path")');
        const STORAGE_PATH = path.join(process.cwd(), 'data', 'elo_ratings.json');

        if (fs.existsSync(STORAGE_PATH)) {
            const data = fs.readFileSync(STORAGE_PATH, 'utf8');
            const payload = JSON.parse(data);

            if (payload.ratings) {
                teamRatings = new Map(Object.entries(payload.ratings));
                lastTrainedTimestamp = payload.lastTrained || 0;
                console.log(`📂 ELO ratings loaded from disk. (${teamRatings.size} teams, Last trained: ${new Date(lastTrainedTimestamp).toLocaleString()})`);
            } else {
                // Legacy format support
                teamRatings = new Map(Object.entries(payload));
                console.log(`📂 ELO ratings loaded from disk. (${teamRatings.size} teams)`);
            }
        }
    } catch (e) {
        console.warn("Could not load ELO ratings, starting fresh.");
    }
}

/**
 * Reset ratings
 */
export function resetEloSystem() {
    teamRatings.clear();
    saveRatings();
}

// Initial load (Server-Only)
if (isServer) {
    loadRatings();
}

/**
 * Get current rating for a team
 */
export function getTeamElo(teamId) {
    if (!teamRatings.has(teamId)) {
        teamRatings.set(teamId, BASE_ELO);
    }
    return teamRatings.get(teamId);
}

/**
 * Calculate Expected Score
 */
export function calculateExpectedScore(ratingA, ratingB) {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculate Win Probability based on ELO Gap
 * V30.7: Ultra-Precision Sync (Reduced local bonus to 25 pts)
 */
export function getEloWinProbability(homeId, awayId, sport = 'football') {
    const rHome = getTeamElo(homeId);
    const rAway = getTeamElo(awayId);

    // Home Advantage Bonus (Modern parity calibration)
    const homeAdvantage = (sport === 'basketball' || sport === 'nba') ? 50 :
        (sport === 'football' || sport === 'soccer') ? 25 : 15;

    const netHomeElo = rHome + homeAdvantage;

    const expectedHome = calculateExpectedScore(netHomeElo, rAway);

    let pHome = expectedHome * 100;
    let pAway = (1 - expectedHome) * 100;
    let pDraw = 0;

    if (sport === 'football' || sport === 'soccer') {
        const gap = Math.abs(netHomeElo - rAway);
        const drawChance = Math.max(10, 26 - (gap / 25)); // Slightly tighter draws

        pDraw = drawChance;
        const remainder = 100 - pDraw;

        pHome = (expectedHome * remainder);
        pAway = ((1 - expectedHome) * remainder);
    }

    return {
        home: Math.round(pHome),
        draw: Math.round(pDraw),
        away: Math.round(pAway),
        homeElo: Math.round(rHome),
        awayElo: Math.round(rAway)
    };
}

/**
 * Process a batch of Finished Matches 
 */
export function trainEloSystem(historyMatches) {
    if (!historyMatches || historyMatches.length === 0) return;

    // V30.8: Training Cooldown (Avoid blocking main flow if recently updated)
    const now = Date.now();
    if (now - lastTrainedTimestamp < TRAINING_COOLDOWN && teamRatings.size > 0) {
        console.log("⏳ ELO Brain: Skipped training (Cooldown active). Memory is fresh.");
        return;
    }

    const sorted = [...historyMatches].sort((a, b) => new Date(a.date) - new Date(b.date));
    let processedCount = 0;

    sorted.forEach(match => {
        if (!match.score || !match.home?.id || !match.away?.id) return;

        const scores = match.score.split('-');
        if (scores.length !== 2) return;

        const sHome = parseInt(scores[0]);
        const sAway = parseInt(scores[1]);
        if (isNaN(sHome) || isNaN(sAway)) return;

        let actualHome = 0;
        if (sHome > sAway) actualHome = 1;
        else if (sHome === sAway) actualHome = 0.5;

        const idHome = match.home.id;
        const idAway = match.away.id;
        const rHome = getTeamElo(idHome);
        const rAway = getTeamElo(idAway);

        const expectedHome = calculateExpectedScore(rHome, rAway);

        const diff = Math.abs(sHome - sAway);
        const movMult = Math.log(diff + 1) + 1;
        const K = K_FACTOR_BASE * movMult;

        const change = K * (actualHome - expectedHome);

        teamRatings.set(idHome, rHome + change);
        teamRatings.set(idAway, rAway - change);

        processedCount++;
    });

    if (processedCount > 0) {
        lastTrainedTimestamp = Date.now();
        saveRatings(); // Persist after training
        console.log(`🧠 ELO Brain: Trained on ${processedCount} matches. Persistence Successful.`);
    }
}
