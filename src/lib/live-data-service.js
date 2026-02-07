// ========================================
// OmniBet AI - REAL-TIME Data Service
// Fetches LIVE data from professional sports APIs
// ========================================

/**
 * FREE Sports APIs that provide real-time data
 * 
 * For REAL production use, get API keys from:
 * - API-Football.com (10,000 requests/day free)
 * - The-Odds-API.com (500 requests/month free)
 * - SofaScore (public, rate-limited)
 * - FlashScore (public, rate-limited)
 */

// API Configuration
const LIVE_APIS = {
    // Free public endpoints (no API key needed for basic data)
    sofascore: {
        base: 'https://api.sofascore.com/api/v1',
        endpoints: {
            liveScores: '/sport/{sport}/events/live',
            matchDetails: '/event/{id}',
            standings: '/unique-tournament/{id}/season/{season}/standings/total',
        }
    },

    // Requires API key (free tier available)
    apiSports: {
        base: 'https://v3.football.api-sports.io',
        headers: {
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': process.env.NEXT_PUBLIC_API_FOOTBALL_KEY || '',
        }
    },

    theOddsApi: {
        base: 'https://api.the-odds-api.com/v4',
        key: process.env.NEXT_PUBLIC_ODDS_API_KEY || '',
    },

    theSportsDb: {
        base: 'https://www.thesportsdb.com/api/v1/json',
        key: process.env.NEXT_PUBLIC_THESPORTSDB_KEY || '3' // '3' is a public test key
    }
};

/**
 * Fetch Live Scores from SofaScore (free, public)
 * Returns currently playing matches
 */
export async function fetchLiveScores(sport = 'football') {
    const sportMap = {
        football: 'football',
        basketball: 'basketball',
        tennis: 'tennis',
        baseball: 'baseball',
        american_football: 'american-football',
    };

    try {
        // SofaScore live endpoint
        const response = await fetch(
            `https://api.sofascore.com/api/v1/sport/${sportMap[sport]}/events/live`,
            {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'OmniBet-AI/2.0',
                },
                next: { revalidate: 30 } // Cache for 30 seconds
            }
        );

        if (!response.ok) {
            console.warn(`SofaScore API returned ${response.status}, using fallback`);
            return null;
        }

        const data = await response.json();
        return transformSofaScoreData(data.events || [], sport);
    } catch (error) {
        console.error('Error fetching live scores:', error);
        return null;
    }
}

/**
 * Fetch upcoming matches from API-Football (requires key)
 */
export async function fetchUpcomingMatches(league = 140, date = null) {
    const apiKey = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY;

    if (!apiKey) {
        console.warn('API_FOOTBALL_KEY not configured, using demo data');
        return null;
    }

    const targetDate = date || new Date().toISOString().split('T')[0];

    try {
        const response = await fetch(
            `${LIVE_APIS.apiSports.base}/fixtures?league=${league}&date=${targetDate}`,
            { headers: LIVE_APIS.apiSports.headers }
        );

        if (!response.ok) throw new Error(`API returned ${response.status}`);

        const data = await response.json();
        return transformApiFootballData(data.response || []);
    } catch (error) {
        console.error('Error fetching upcoming matches:', error);
        return null;
    }
}

/**
 * Fetch live odds from The Odds API
 */
export async function fetchLiveOdds(sport = 'soccer', market = 'h2h') {
    const apiKey = process.env.NEXT_PUBLIC_ODDS_API_KEY;

    if (!apiKey) {
        console.warn('ODDS_API_KEY not configured');
        return null;
    }

    const sportKeys = {
        football: 'soccer_epl',
        basketball: 'basketball_nba',
        tennis: 'tennis_atp_us_open',
        baseball: 'baseball_mlb',
        nfl: 'americanfootball_nfl',
    };

    try {
        const response = await fetch(
            `${LIVE_APIS.theOddsApi.base}/sports/${sportKeys[sport]}/odds/?apiKey=${apiKey}&regions=eu&markets=${market}`,
        );

        if (!response.ok) throw new Error(`Odds API returned ${response.status}`);

        return await response.json();
    } catch (error) {
        console.error('Error fetching odds:', error);
        return null;
    }
}

/**
 * Fetch player stats
 */
export async function fetchPlayerStats(playerId, season = 2024) {
    const apiKey = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY;

    if (!apiKey) return null;

    try {
        const response = await fetch(
            `${LIVE_APIS.apiSports.base}/players?id=${playerId}&season=${season}`,
            { headers: LIVE_APIS.apiSports.headers }
        );

        if (!response.ok) throw new Error(`API returned ${response.status}`);

        const data = await response.json();
        return data.response?.[0] || null;
    } catch (error) {
        console.error('Error fetching player stats:', error);
        return null;
    }
}

/**
 * Fetch H2H (Head-to-Head) data
 */
export async function fetchH2H(team1Id, team2Id) {
    const apiKey = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY;

    if (!apiKey) return null;

    try {
        const response = await fetch(
            `${LIVE_APIS.apiSports.base}/fixtures/headtohead?h2h=${team1Id}-${team2Id}`,
            { headers: LIVE_APIS.apiSports.headers }
        );

        if (!response.ok) throw new Error(`API returned ${response.status}`);

        const data = await response.json();
        return data.response || [];
    } catch (error) {
        console.error('Error fetching H2H:', error);
        return null;
    }
}

/**
 * Transform SofaScore data to our format
 */
function transformSofaScoreData(events, sport) {
    return events.map(event => {
        const isLive = event.status?.type === 'inprogress';

        return {
            id: `sofa-${event.id}`,
            externalId: event.id,
            source: 'sofascore',
            sport,
            sportIcon: getSportIcon(sport),
            league: event.tournament?.name || 'Unknown',
            home: {
                name: event.homeTeam?.name || 'TBD',
                logo: '',
                country: event.homeTeam?.country?.alpha2 || '',
                score: event.homeScore?.current || 0,
            },
            away: {
                name: event.awayTeam?.name || 'TBD',
                logo: '',
                country: event.awayTeam?.country?.alpha2 || '',
                score: event.awayScore?.current || 0,
            },
            isLive,
            status: isLive ? 'live' : 'upcoming',
            liveMinute: isLive ? formatLiveTime(event, sport) : null,
            startTime: new Date(event.startTimestamp * 1000).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            }),
            // Real-time data flag
            isRealData: true,
            lastUpdated: new Date().toISOString(),
        };
    });
}

/**
 * Transform API-Football data to our format
 */
function transformApiFootballData(fixtures) {
    return fixtures.map(fixture => {
        const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(fixture.fixture?.status?.short);

        return {
            id: `apif-${fixture.fixture.id}`,
            externalId: fixture.fixture.id,
            source: 'api-football',
            sport: 'football',
            sportIcon: '⚽',
            league: fixture.league?.name || 'Unknown',
            home: {
                id: fixture.teams.home.id,
                name: fixture.teams.home.name,
                logo: fixture.teams.home.logo,
                score: fixture.goals?.home || 0,
            },
            away: {
                id: fixture.teams.away.id,
                name: fixture.teams.away.name,
                logo: fixture.teams.away.logo,
                score: fixture.goals?.away || 0,
            },
            isLive,
            status: isLive ? 'live' : fixture.fixture?.status?.short === 'FT' ? 'finished' : 'upcoming',
            liveMinute: fixture.fixture?.status?.elapsed ? `${fixture.fixture.status.elapsed}'` : null,
            startTime: new Date(fixture.fixture.date).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            }),
            venue: fixture.fixture?.venue?.name,
            isRealData: true,
            lastUpdated: new Date().toISOString(),
        };
    })
        // Filter out finished matches
        .filter(match => match.status !== 'finished');
}

/**
 * Helper functions
 */
function getSportIcon(sport) {
    const icons = {
        football: '⚽',
        basketball: '🏀',
        tennis: '🎾',
        baseball: '⚾',
        nfl: '🏈',
    };
    return icons[sport] || '🏆';
}

function formatLiveTime(event, sport) {
    if (sport === 'tennis') {
        const sets = event.currentPeriodStartTimestamp ?
            (event.homeScore?.period1 || 0) + (event.awayScore?.period1 || 0) + 1 : 1;
        return `Set ${sets}`;
    }
    return event.status?.clock ? event.status.clock :
        event.status?.description || 'En vivo';
}

/**
 * Master function: Get all live data with fallback
 */
export async function getRealTimeData(sport = 'all') {
    const results = {
        live: [],
        upcoming: [],
        source: 'demo',
        isRealData: false,
    };

    try {
        // Try to fetch real live scores
        if (sport === 'all') {
            const footballLive = await fetchLiveScores('football');
            const tennisLive = await fetchLiveScores('tennis');
            const basketballLive = await fetchLiveScores('basketball');

            if (footballLive) results.live.push(...footballLive);
            if (tennisLive) results.live.push(...tennisLive);
            if (basketballLive) results.live.push(...basketballLive);

            if (results.live.length > 0) {
                results.source = 'sofascore';
                results.isRealData = true;
            }
        } else {
            const liveData = await fetchLiveScores(sport);
            if (liveData) {
                results.live = liveData;
                results.source = 'sofascore';
                results.isRealData = true;
            }
        }

        // Try to get upcoming from API-Football
        const upcomingData = await fetchUpcomingMatches();
        if (upcomingData) {
            results.upcoming = upcomingData;
        }

    } catch (error) {
        console.error('Error fetching real-time data:', error);
    }

    return results;
}

/**
 * Check API connectivity
 */
export async function checkApiStatus() {
    const status = {
        sofascore: false,
        apiFootball: false,
        oddsApi: false,
    };

    try {
        const test = await fetch('https://api.sofascore.com/api/v1/sport/football/events/live', {
            method: 'HEAD',
            headers: { 'Accept': 'application/json' }
        });
        status.sofascore = test.ok;
    } catch (e) {
        console.log('SofaScore not reachable');
    }

    if (process.env.NEXT_PUBLIC_API_FOOTBALL_KEY) {
        status.apiFootball = true;
    }

    if (process.env.NEXT_PUBLIC_ODDS_API_KEY) {
        status.oddsApi = true;
    }

    return status;
}

export default {
    fetchLiveScores,
    fetchUpcomingMatches,
    fetchLiveOdds,
    fetchPlayerStats,
    fetchH2H,
    getRealTimeData,
    checkApiStatus,
};
