/**
 * OmniBet AI - PatternScout (Oracle V12.0)
 * Uses Sequence Analysis and Hidden State logic to detect momentum shifts.
 */

const HIDDEN_STATES = {
    UNSTOPPABLE: { id: 'unstoppable', label: 'Imparable', color: '#ff00ff', multiplier: 1.15, icon: '🚀' },
    OVER_PERFORMING: { id: 'over_performing', label: 'Racha Límite', color: '#00ffcc', multiplier: 0.95, icon: '⚠️' }, // Risk of crash
    STABLE: { id: 'stable', label: 'Estable', color: '#ffffff', multiplier: 1.0, icon: '⚖️' },
    RECOVERING: { id: 'recovering', label: 'Recuperando', color: '#ffff00', multiplier: 1.1, icon: '🔄' }, // Bounce back
    CRISIS: { id: 'crisis', label: 'Crisis', color: '#ff4444', multiplier: 0.85, icon: '📉' },
    BOUNCE_BACK: { id: 'bounce_back', label: 'Rebote', color: '#00d4ff', multiplier: 1.25, icon: '👁️' }
};

/**
 * analyzes a sequence of results (e.g., ['W', 'W', 'W', 'D', 'L'])
 * @param {Array<string>} sequence 
 * @param {boolean} isPremiumTeam - e.g. Real Madrid, Man City
 * @returns {Object} Detected State
 */
export function analyzeSequence(sequence = [], isPremiumTeam = false) {
    if (!sequence || sequence.length < 3) return HIDDEN_STATES.STABLE;

    const last_3 = sequence.slice(0, 3);
    const last_5 = sequence.slice(0, 5);

    const wins = last_5.filter(r => r === 'W').length;
    const losses = last_5.filter(r => r === 'L').length;
    const draws = last_5.filter(r => r === 'D').length;

    const streak = getStreak(sequence);

    // 1. BOUNCE BACK PATTERN (Premium team lost/drew recently after a good run)
    if (isPremiumTeam && (last_3[0] === 'L' || last_3[0] === 'D') && (wins >= 3)) {
        return HIDDEN_STATES.BOUNCE_BACK;
    }

    // 2. UNSTOPPABLE (4+ Wins in a row)
    if (streak.type === 'W' && streak.count >= 4) {
        return HIDDEN_STATES.UNSTOPPABLE;
    }

    // 3. OVER-PERFORMING / CRASH RISK (Small team with many wins, about to regress to mean)
    if (!isPremiumTeam && wins >= 4 && streak.count >= 3) {
        return HIDDEN_STATES.OVER_PERFORMING;
    }

    // 4. CRISIS (3+ Losses in a row)
    if (losses >= 3 && streak.type === 'L' && streak.count >= 3) {
        return HIDDEN_STATES.CRISIS;
    }

    // 5. RECOVERING (Was losing, but last game was a Win)
    if (last_3[0] === 'W' && sequence[1] === 'L' && sequence[2] === 'L') {
        return HIDDEN_STATES.RECOVERING;
    }

    return HIDDEN_STATES.STABLE;
}

/**
 * Counts the current active streak
 */
function getStreak(sequence) {
    if (!sequence.length) return { type: 'N', count: 0 };
    const first = sequence[0];
    let count = 0;
    for (let res of sequence) {
        if (res === first) count++;
        else break;
    }
    return { type: first, count };
}

/**
 * Detects specific Oracle V12 Patterns
 */
export function detectOraclePatterns(homeSequence, awaySequence, homeIsGiant, awayIsGiant) {
    const homeState = analyzeSequence(homeSequence, homeIsGiant);
    const awayState = analyzeSequence(awaySequence, awayIsGiant);

    const patterns = [];

    // Interaction Patterns
    if (homeState.id === 'bounce_back') {
        patterns.push({
            id: 'premium_bounce',
            title: 'Efecto Rebate de Gigante',
            description: 'Un equipo elite suele corregir racha tras un tropiezo.',
            impact: 'home',
            strength: 'high'
        });
    }

    if (homeState.id === 'over_performing' && awayIsGiant) {
        patterns.push({
            id: 'regression_to_mean',
            title: 'Regresión a la Media',
            description: 'Racha insostenible del local frente a un rival superior.',
            impact: 'away',
            strength: 'medium'
        });
    }

    if (homeState.id === 'crisis' && awayState.id === 'unstoppable') {
        patterns.push({
            id: 'perfect_storm',
            title: 'Tormenta Perfecta',
            description: 'Colisión de un equipo en caída libre contra uno imparable.',
            impact: 'away',
            strength: 'extreme'
        });
    }

    return {
        homeState,
        awayState,
        patterns,
        adjustmentMultiplier: (homeState.multiplier / awayState.multiplier)
    };
}
