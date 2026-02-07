/**
 * Tactical Database Agent ♟️
 * Analyzes stylistic matchups
 * "The Tactician" Agent
 */

const TEAM_STYLES = {
    // Possession Heavy
    'Manchester City': 'possession',
    'Barcelona': 'possession',
    'Arsenal': 'possession',
    'Bayern Munich': 'possession',

    // Counter Attack
    'Real Madrid': 'counter',
    'Atletico Madrid': 'defensive_counter',
    'Inter Milan': 'direct',

    // High Press
    'Liverpool': 'high_press',
    'Bayer Leverkusen': 'high_press',

    // Low Block (Park the bus)
    'Getafe': 'low_block',
    'Everton': 'low_block'
};

const MATCHUP_MATRIX = {
    'possession': { 'low_block': 'struggle', 'high_press': 'risk', 'counter': 'vulnerable' },
    'counter': { 'possession': 'advantage', 'low_block': 'stalemate' },
    'high_press': { 'possession': 'effective', 'direct': 'risk' },
    'low_block': { 'possession': 'effective', 'counter': 'boring' }
};

export function analyzeTactics(homeTeam, awayTeam) {
    const homeStyle = TEAM_STYLES[homeTeam] || 'balanced';
    const awayStyle = TEAM_STYLES[awayTeam] || 'balanced';

    // Simple analysis
    let insight = '';
    let advantage = 'none';

    if (MATCHUP_MATRIX[homeStyle]?.[awayStyle]) {
        const result = MATCHUP_MATRIX[homeStyle][awayStyle];
        if (result === 'struggle') {
            insight = `Stylistic Mismatch: ${homeTeam} struggles against Low Block`;
            advantage = 'away';
        } else if (result === 'vulnerable') {
            insight = `Counter-Attack Risk: ${homeTeam} vulnerable to breaks`;
            advantage = 'away';
        } else if (result === 'advantage') {
            insight = `Perfect Matchup: ${homeTeam} loves playing against Possession`;
            advantage = 'home';
        }
    }

    return {
        homeStyle,
        awayStyle,
        insight,
        advantage
    };
}
