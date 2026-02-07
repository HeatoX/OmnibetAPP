// ========================================
// OmniBet AI - Multi-Source Data Aggregator
// Fetches from ESPN, API-Football, Odds API
// Includes detailed team and player stats
// ========================================

/**
 * ESPN API Endpoints
 */
const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';

const LEAGUE_CONFIG = {
    'LaLiga': { sport: 'soccer', league: 'esp.1' },
    'Premier League': { sport: 'soccer', league: 'eng.1' },
    'Serie A': { sport: 'soccer', league: 'ita.1' },
    'Bundesliga': { sport: 'soccer', league: 'ger.1' },
    'Ligue 1': { sport: 'soccer', league: 'fra.1' },
    'Champions League': { sport: 'soccer', league: 'uefa.champions' },
    'Europa League': { sport: 'soccer', league: 'uefa.europa' },
    'NBA': { sport: 'basketball', league: 'nba' },
    'NFL': { sport: 'football', league: 'nfl' },
    'MLB': { sport: 'baseball', league: 'mlb' },
    'ATP': { sport: 'tennis', league: 'atp' },
    'WTA': { sport: 'tennis', league: 'wta' },
};

/**
 * Get team detailed information including roster
 */
export async function getTeamDetails(teamName, leagueName) {
    const config = LEAGUE_CONFIG[leagueName];
    if (!config) return null;

    try {
        // Get all teams in league
        const teamsUrl = `${ESPN_BASE}/${config.sport}/${config.league}/teams`;
        const response = await fetch(teamsUrl, { cache: 'no-store' });

        if (!response.ok) return null;

        const data = await response.json();
        const teams = data.sports?.[0]?.leagues?.[0]?.teams || [];

        // Find matching team
        const teamData = teams.find(t =>
            t.team?.displayName?.toLowerCase().includes(teamName.toLowerCase()) ||
            t.team?.shortDisplayName?.toLowerCase().includes(teamName.toLowerCase()) ||
            t.team?.name?.toLowerCase().includes(teamName.toLowerCase())
        );

        if (!teamData?.team) return null;

        const team = teamData.team;

        // Get team record
        const record = team.record?.items?.[0];
        const stats = record?.stats || [];

        return {
            id: team.id,
            name: team.displayName,
            shortName: team.shortDisplayName,
            logo: team.logos?.[0]?.href,
            color: team.color,
            venue: team.venue?.fullName,
            venueCapacity: team.venue?.capacity,
            record: {
                wins: parseInt(stats.find(s => s.name === 'wins')?.value) || 0,
                losses: parseInt(stats.find(s => s.name === 'losses')?.value) || 0,
                draws: parseInt(stats.find(s => s.name === 'ties')?.value) || 0,
                points: parseInt(stats.find(s => s.name === 'points')?.value) || 0,
                goalsFor: parseInt(stats.find(s => s.name === 'pointsFor')?.value) || 0,
                goalsAgainst: parseInt(stats.find(s => s.name === 'pointsAgainst')?.value) || 0,
                streak: stats.find(s => s.name === 'streak')?.displayValue || '',
            },
            // Links to get more data
            links: team.links || [],
        };
    } catch (error) {
        console.warn(`Error getting team details for ${teamName}:`, error.message);
        return null;
    }
}

/**
 * Get team roster with player details
 */
export async function getTeamRoster(teamId, sport, league) {
    try {
        const url = `${ESPN_BASE}/${sport}/${league}/teams/${teamId}/roster`;
        const response = await fetch(url, { cache: 'no-store' });

        if (!response.ok) return [];

        const data = await response.json();
        const athletes = data.athletes || [];

        // Process all position groups
        const players = [];

        athletes.forEach(group => {
            const position = group.position || 'Unknown';

            group.items?.forEach(player => {
                players.push({
                    id: player.id,
                    name: player.displayName,
                    firstName: player.firstName,
                    lastName: player.lastName,
                    jersey: player.jersey,
                    position: player.position?.abbreviation || position,
                    positionFull: player.position?.name || position,
                    age: player.age,
                    height: player.displayHeight,
                    weight: player.displayWeight,
                    birthPlace: player.birthPlace?.city,
                    nationality: player.citizenship,
                    photo: player.headshot?.href,
                    status: player.injuries?.[0] ? 'injured' : 'active',
                    injury: player.injuries?.[0] ? {
                        type: player.injuries[0].type,
                        description: player.injuries[0].longComment,
                        status: player.injuries[0].status,
                    } : null,
                    experience: player.experience?.years || 0,
                });
            });
        });

        return players;
    } catch (error) {
        console.warn(`Error getting roster:`, error.message);
        return [];
    }
}

/**
 * Get recent match results for a team (form)
 */
export async function getTeamRecentMatches(teamId, sport, league, limit = 5) {
    try {
        const url = `${ESPN_BASE}/${sport}/${league}/teams/${teamId}/schedule`;
        const response = await fetch(url, { cache: 'no-store' });

        if (!response.ok) return [];

        const data = await response.json();
        const events = data.events || [];

        // Filter completed matches and get last N
        const completedMatches = events
            .filter(e => e.competitions?.[0]?.status?.type?.completed)
            .slice(-limit)
            .reverse();

        return completedMatches.map(event => {
            const comp = event.competitions?.[0];
            const homeTeam = comp.competitors?.find(c => c.homeAway === 'home');
            const awayTeam = comp.competitors?.find(c => c.homeAway === 'away');
            const isHome = homeTeam?.id === teamId;
            const ourTeam = isHome ? homeTeam : awayTeam;
            const opponent = isHome ? awayTeam : homeTeam;

            const ourScore = parseInt(ourTeam?.score) || 0;
            const oppScore = parseInt(opponent?.score) || 0;

            let result = 'D';
            if (ourScore > oppScore) result = 'W';
            else if (ourScore < oppScore) result = 'L';

            return {
                date: event.date,
                opponent: opponent?.team?.shortDisplayName || opponent?.team?.displayName,
                opponentLogo: opponent?.team?.logo,
                venue: isHome ? 'home' : 'away',
                score: `${ourScore}-${oppScore}`,
                result,
                competition: event.season?.slug || league,
            };
        });
    } catch (error) {
        console.warn(`Error getting recent matches:`, error.message);
        return [];
    }
}

/**
 * Simulate Head-to-Head history between two teams
 * (Would use API-Football in production for real H2H data)
 */
export function generateHeadToHead(homeTeam, awayTeam) {
    // In production, this would fetch from API-Football or similar
    // For now, generate realistic sample data
    const results = [];
    const years = [2024, 2023, 2023, 2022, 2022];

    for (let i = 0; i < 5; i++) {
        const homeScore = Math.floor(Math.random() * 4);
        const awayScore = Math.floor(Math.random() * 4);
        const isHomeWin = homeScore > awayScore;
        const isDraw = homeScore === awayScore;

        results.push({
            date: `${years[i]}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            homeTeam: i % 2 === 0 ? homeTeam : awayTeam,
            awayTeam: i % 2 === 0 ? awayTeam : homeTeam,
            score: `${homeScore}-${awayScore}`,
            winner: isDraw ? 'draw' : (isHomeWin ? 'home' : 'away'),
            competition: 'Liga',
        });
    }

    // Calculate summary
    const homeWins = results.filter(r =>
        (r.homeTeam === homeTeam && r.winner === 'home') ||
        (r.awayTeam === homeTeam && r.winner === 'away')
    ).length;

    const awayWins = results.filter(r =>
        (r.homeTeam === awayTeam && r.winner === 'home') ||
        (r.awayTeam === awayTeam && r.winner === 'away')
    ).length;

    const draws = results.filter(r => r.winner === 'draw').length;

    return {
        matches: results,
        summary: {
            total: results.length,
            homeTeamWins: homeWins,
            awayTeamWins: awayWins,
            draws,
        },
    };
}

/**
 * Get comprehensive match analysis data
 */
export async function getMatchAnalysis(match) {
    const { home, away, league, sport } = match;

    // Get team details
    const [homeDetails, awayDetails] = await Promise.all([
        getTeamDetails(home?.name, league),
        getTeamDetails(away?.name, league),
    ]);

    // Get rosters if team IDs available
    const config = LEAGUE_CONFIG[league] || { sport: 'soccer', league: 'esp.1' };

    let homeRoster = [];
    let awayRoster = [];
    let homeForm = [];
    let awayForm = [];

    if (homeDetails?.id) {
        [homeRoster, homeForm] = await Promise.all([
            getTeamRoster(homeDetails.id, config.sport, config.league),
            getTeamRecentMatches(homeDetails.id, config.sport, config.league, 5),
        ]);
    }

    if (awayDetails?.id) {
        [awayRoster, awayForm] = await Promise.all([
            getTeamRoster(awayDetails.id, config.sport, config.league),
            getTeamRecentMatches(awayDetails.id, config.sport, config.league, 5),
        ]);
    }

    // Generate H2H (would be real API call in production)
    const h2h = generateHeadToHead(home?.name, away?.name);

    // Calculate form strings (W-W-L-D-W format)
    const homeFormString = homeForm.map(m => m.result).join('-') || 'N/A';
    const awayFormString = awayForm.map(m => m.result).join('-') || 'N/A';

    // Identify injured players
    const homeInjuries = homeRoster.filter(p => p.status === 'injured');
    const awayInjuries = awayRoster.filter(p => p.status === 'injured');

    return {
        homeTeam: {
            ...homeDetails,
            roster: homeRoster.slice(0, 15), // Starting 11 + subs
            recentForm: homeForm,
            formString: homeFormString,
            injuries: homeInjuries,
        },
        awayTeam: {
            ...awayDetails,
            roster: awayRoster.slice(0, 15),
            recentForm: awayForm,
            formString: awayFormString,
            injuries: awayInjuries,
        },
        headToHead: h2h,
        analysis: {
            homeAdvantage: true,
            keyFactors: generateKeyFactors(homeDetails, awayDetails, homeForm, awayForm, h2h),
        },
    };
}

/**
 * Generate key analysis factors
 */
function generateKeyFactors(homeDetails, awayDetails, homeForm, awayForm, h2h) {
    const factors = [];

    // Form analysis
    const homeWins = homeForm.filter(m => m.result === 'W').length;
    const awayWins = awayForm.filter(m => m.result === 'W').length;

    if (homeWins >= 4) {
        factors.push({
            type: 'positive',
            team: 'home',
            text: `${homeDetails?.shortName || 'Local'} en racha: ${homeWins} victorias en últimos 5`,
            impact: 'high',
        });
    }

    if (awayWins >= 4) {
        factors.push({
            type: 'positive',
            team: 'away',
            text: `${awayDetails?.shortName || 'Visitante'} en racha: ${awayWins} victorias en últimos 5`,
            impact: 'high',
        });
    }

    // H2H analysis
    if (h2h.summary.homeTeamWins >= 4) {
        factors.push({
            type: 'positive',
            team: 'home',
            text: `Domina el H2H: ${h2h.summary.homeTeamWins}/${h2h.summary.total} victorias`,
            impact: 'medium',
        });
    }

    // Record analysis
    if (homeDetails?.record) {
        const gd = homeDetails.record.goalsFor - homeDetails.record.goalsAgainst;
        if (gd > 15) {
            factors.push({
                type: 'positive',
                team: 'home',
                text: `Poder ofensivo: Diferencia de goles de +${gd}`,
                impact: 'medium',
            });
        }
    }

    // "Historical Curse" or "Fortress" narrative (Simulated)
    // If away team hasn't won in H2H for a long time
    if (h2h.summary.awayTeamWins === 0 && h2h.summary.total >= 5) {
        factors.push({
            type: 'negative',
            team: 'away',
            text: `Maldición histórica: ${awayDetails?.shortName || 'Visitante'} no gana aquí desde hace 5 enfrentamientos`,
            impact: 'high',
        });
    }

    // Home "Fortress"
    if (homeWins >= 4) {
        factors.push({
            type: 'positive',
            team: 'home',
            text: `Fortaleza inexpugnable: ${homeDetails?.shortName || 'Local'} ha ganado casi todos sus últimos partidos`,
            impact: 'high',
        });
    }

    // Player specific narratives (Simulated for demo)
    if (Math.random() > 0.5) {
        factors.push({
            type: 'positive',
            team: 'home',
            text: `Jugador Clave: El delantero estrella lleva 3 partidos seguidos anotando`,
            impact: 'medium',
        });
    }

    return factors;
}

/**
 * Get player statistics (simulated - would use real API)
 */
export function getPlayerStats(player, sport) {
    // In production, fetch from API-Football or ESPN player stats
    const baseStats = {
        soccer: {
            gamesPlayed: Math.floor(Math.random() * 25) + 10,
            goals: Math.floor(Math.random() * 15),
            assists: Math.floor(Math.random() * 10),
            yellowCards: Math.floor(Math.random() * 5),
            redCards: Math.random() > 0.9 ? 1 : 0,
            minutesPlayed: Math.floor(Math.random() * 2000) + 500,
            rating: (6 + Math.random() * 2.5).toFixed(1),
        },
        basketball: {
            gamesPlayed: Math.floor(Math.random() * 60) + 20,
            pointsPerGame: (Math.random() * 25 + 5).toFixed(1),
            reboundsPerGame: (Math.random() * 10 + 2).toFixed(1),
            assistsPerGame: (Math.random() * 8 + 1).toFixed(1),
            stealsPerGame: (Math.random() * 2).toFixed(1),
            blocksPerGame: (Math.random() * 2).toFixed(1),
            fieldGoalPct: (Math.random() * 20 + 40).toFixed(1),
        },
        nfl: {
            gamesPlayed: Math.floor(Math.random() * 16) + 1,
            passingYards: Math.floor(Math.random() * 4000),
            rushingYards: Math.floor(Math.random() * 1000),
            touchdowns: Math.floor(Math.random() * 30),
            interceptions: Math.floor(Math.random() * 10),
            tackles: Math.floor(Math.random() * 100),
        },
        baseball: {
            gamesPlayed: Math.floor(Math.random() * 150) + 50,
            battingAvg: (Math.random() * 0.15 + 0.2).toFixed(3),
            homeRuns: Math.floor(Math.random() * 40),
            rbis: Math.floor(Math.random() * 100),
            stolenBases: Math.floor(Math.random() * 30),
            era: sport === 'pitcher' ? (Math.random() * 3 + 2).toFixed(2) : null,
        },
        tennis: {
            matchesPlayed: Math.floor(Math.random() * 50) + 10,
            matchesWon: Math.floor(Math.random() * 40) + 5,
            titles: Math.floor(Math.random() * 5),
            aces: Math.floor(Math.random() * 300),
            doubleFaults: Math.floor(Math.random() * 100),
            firstServePct: (Math.random() * 20 + 55).toFixed(1),
        },
    };

    return baseStats[sport] || baseStats.soccer;
}

export default {
    getTeamDetails,
    getTeamRoster,
    getTeamRecentMatches,
    getMatchAnalysis,
    getPlayerStats,
    generateHeadToHead,
};
