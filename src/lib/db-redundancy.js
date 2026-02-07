/**
 * OmniBet AI - Zero-Cost Database Redundancy Layer
 * Ensures the app "never collapses" by using local storage and multi-source fallbacks.
 */

const CACHE_KEY = 'omnibet_matches_cache';
const CONFIG_KEY = 'omnibet_engine_weights';

/**
 * Sync current matches to local storage for offline/failover use
 */
export function syncToColdStorage(matches) {
    if (!matches || matches.length === 0) return;

    const payload = {
        timestamp: Date.now(),
        data: matches
    };

    // Client-Side (Browser)
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
        } catch (e) { console.warn('Browser Sync Failed:', e); }
        return;
    }

    // Server-Side (Disk)
    try {
        const fs = eval('require("fs")');
        const path = eval('require("path")');
        const STORAGE_PATH = path.join(process.cwd(), 'data', 'matches_cache.json');

        const dataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

        fs.writeFileSync(STORAGE_PATH, JSON.stringify(payload, null, 2));
        console.log("🛡️ Server Redundancy: Matches synced to disk.");
    } catch (e) {
        console.error('Server Redundancy Sync Failed:', e);
    }
}

/**
 * Retrieve matches from local storage if primary DB fails
 */
export function getFromColdStorage() {
    // Client-Side (Browser)
    if (typeof window !== 'undefined') {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (!cached) return null;
            const payload = JSON.parse(cached);

            // Limit to 24h in browser
            if (Date.now() - payload.timestamp > 86400000) return null;

            console.log('🛡️ Browser Redundancy: Serving from LocalStorage');
            return payload.data;
        } catch (e) { return null; }
    }

    // Server-Side (Disk)
    try {
        const fs = eval('require("fs")');
        const path = eval('require("path")');
        const STORAGE_PATH = path.join(process.cwd(), 'data', 'matches_cache.json');

        if (fs.existsSync(STORAGE_PATH)) {
            const raw = fs.readFileSync(STORAGE_PATH, 'utf8');
            const payload = JSON.parse(raw);

            // Server safety: 48h window
            if (Date.now() - payload.timestamp > 172800000) return null;

            console.log('🛡️ Server Redundancy Active: Serving matches from disk.');
            return payload.data;
        }
    } catch (e) {
        console.warn("Server Redundancy fetch failed:", e.message);
    }
    return null;
}

/**
 * Neural Weight Backup: Save calibrated weights locally
 */
export function backupNeuralWeights(weights) {
    if (!weights || typeof window === 'undefined') return;
    localStorage.setItem(CONFIG_KEY, JSON.stringify(weights));
}

/**
 * Neural Weight Recovery: Load last known good weights
 */
export function recoverNeuralWeights() {
    if (typeof window === 'undefined') return null;
    try {
        const cached = localStorage.getItem(CONFIG_KEY);
        return cached ? JSON.parse(cached) : null;
    } catch (e) {
        return null;
    }
}

/**
 * Execute a fetch with automatic failover to redundancy
 */
export async function resilientFetch(primaryPromise) {
    try {
        const result = await primaryPromise;
        // V30.11: Empty-to-Redundancy Failover
        // If API responds successfully but with NO matches, trigger redundancy fallback
        if (result && result.matches && result.matches.length > 0) {
            syncToColdStorage(result.matches);
            return result;
        }

        console.warn('⚠️ Primary source returned empty or invalid data. Forcing redundancy fallback...');
        throw new Error('Empty data from primary source');
    } catch (error) {
        console.error('Primary source failed, falling back to redundancy...', error);
        try {
            const cachedMatches = getFromColdStorage();
            if (cachedMatches && cachedMatches.length > 0) {
                return { matches: cachedMatches, source: 'redundancy' };
            }
        } catch (e) { }

        // Final Failsafe: Return empty matches object rather than crashing the route
        return { matches: [], error: error.message, source: 'error-failsafe' };
    }
}
