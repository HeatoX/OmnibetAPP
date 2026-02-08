/**
 * Oráculo Quantum (V40.0) - Tactical DNA Engine
 * Analyzes and classifies team playstyles.
 */

export const TACTICAL_STYLES = {
    VERTICAL_COUNTER: { id: 'vertical_counter', label: 'Contraataque Vertical', bonusVs: ['possession_slow'], malusVs: ['high_pressure'] },
    HIGH_PRESSURE: { id: 'high_pressure', label: 'Presión Alta', bonusVs: ['possession_slow'], malusVs: ['vertical_counter'] },
    POSSESSION_SLOW: { id: 'possession_slow', label: 'Posesión Lenta', bonusVs: ['parking_bus'], malusVs: ['high_pressure', 'vertical_counter'] },
    PARKING_BUS: { id: 'parking_bus', label: 'Autobús (Defensa Total)', bonusVs: ['vertical_counter'], malusVs: ['possession_slow'] },
    WINGS_ASSAULT: { id: 'wings_assault', label: 'Asedio por Bandas', bonusVs: ['parking_bus'], malusVs: ['vertical_counter'] },
    BALANCED: { id: 'balanced', label: 'Equilibrado', bonusVs: [], malusVs: [] }
};

/**
 * Derives a Tactical DNA from team stats.
 * @param {Object} stats - Team aggregated stats
 */
export function identifyTacticalADN(teamName, leaders = [], recentGames = []) {
    // 1. Static ADN for World Giants (The "Known ADN")
    const fixedADN = {
        'manchester city': TACTICAL_STYLES.POSSESSION_SLOW,
        'liverpool': TACTICAL_STYLES.HIGH_PRESSURE,
        'real madrid': TACTICAL_STYLES.VERTICAL_COUNTER,
        'atletico madrid': TACTICAL_STYLES.PARKING_BUS,
        'bayern münchen': TACTICAL_STYLES.WINGS_ASSAULT,
        'barcelona': TACTICAL_STYLES.POSSESSION_SLOW,
    };

    const lowerName = teamName.toLowerCase();
    for (let key in fixedADN) {
        if (lowerName.includes(key)) return fixedADN[key];
    }

    // 2. Dynamic Inference (The "Tactical Ghost")
    // If team has many assist leaders relative to goals, it's likely Possession or Wings
    const assists = leaders.find(l => l.name === 'Asistencias')?.value || 0;
    const goals = leaders.find(l => l.name === 'Goles')?.value || 0;

    const winRatio = recentGames.filter(g => g.result === 'W').length / (recentGames.length || 1);

    if (assists > goals * 0.8) return TACTICAL_STYLES.POSSESSION_SLOW;
    if (goals > 5 && winRatio < 0.4) return TACTICAL_STYLES.VERTICAL_COUNTER; // Likely clinical but struggling to control
    if (winRatio > 0.7) return TACTICAL_STYLES.HIGH_PRESSURE; // Dominant teams usually press high

    return TACTICAL_STYLES.BALANCED;
}

/**
 * Calculates the tactical match-up advantage
 */
export function getTacticalAdvantage(homeADN, awayADN) {
    let advantage = 1.0;

    if (homeADN.bonusVs.includes(awayADN.id)) advantage += 0.07;
    if (homeADN.malusVs.includes(awayADN.id)) advantage -= 0.05;

    if (awayADN.bonusVs.includes(homeADN.id)) advantage -= 0.07;
    if (awayADN.malusVs.includes(homeADN.id)) advantage += 0.05;

    return Number(advantage.toFixed(2));
}
