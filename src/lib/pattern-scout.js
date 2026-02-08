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
 * V30.60: BAYESIAN LATENT STATE INFERENCE (HMM-lite)
 * Instead of simple IF/ELSE, calculate probabilities for each state.
 */
export function analyzeSequence(sequence = [], isPremiumTeam = false) {
    const states = { ...HIDDEN_STATES };
    if (!sequence || sequence.length === 0) return states.STABLE;

    const last_5 = sequence.slice(0, 5);
    const wins = last_5.filter(r => r === 'W').length;
    const losses = last_5.filter(r => r === 'L').length;
    const draws = last_5.filter(r => r === 'D').length;
    const streak = getStreak(sequence);

    // Initial Probabilities (Priors)
    const probs = {
        unstoppable: 0.1,
        stable: 0.6,
        crisis: 0.1,
        recovering: 0.1,
        bounce_back: isPremiumTeam ? 0.1 : 0
    };

    // Likelihood Updates (Evidence)
    // 1. Unstoppable Evidence
    if (streak.type === 'W') probs.unstoppable += (streak.count * 0.15);
    if (wins >= 4) probs.unstoppable += 0.3;

    // 2. Crisis Evidence
    if (streak.type === 'L') probs.crisis += (streak.count * 0.15);
    if (losses >= 3) probs.crisis += 0.2;

    // 3. Bounce Back (Premium team logic)
    if (isPremiumTeam && (last_5[0] === 'L' || last_5[0] === 'D') && wins >= 3) {
        probs.bounce_back += 0.5;
    }

    // 4. Recovery
    if (last_5[0] === 'W' && (last_5[1] === 'L' || last_5[1] === 'D')) {
        probs.recovering += 0.3;
    }

    // Normalize and pick Winner (Softmax-like)
    let maxProb = 0;
    let winnerId = 'stable';

    Object.keys(probs).forEach(id => {
        if (probs[id] > maxProb) {
            maxProb = probs[id];
            winnerId = id;
        }
    });

    // Return the dominant state with a calculated dynamic multiplier
    const finalState = { ...states[winnerId.toUpperCase()] };

    // Dynamic Multiplier: Scale the baseline by the confidence (maxProb)
    const baseline = finalState.multiplier;
    const intensity = Math.min(1.0, maxProb); // Confidence in the state

    if (baseline > 1) {
        finalState.multiplier = 1 + (baseline - 1) * intensity;
    } else if (baseline < 1) {
        finalState.multiplier = 1 - (1 - baseline) * intensity;
    }

    return {
        ...finalState,
        confidence: Math.min(100, Math.round(maxProb * 100))
    };
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
