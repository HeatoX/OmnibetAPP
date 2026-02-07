/**
 * Vortex Oscillator (V30 Supreme)
 * Measures Professional Capital Intensity (Quant Market analysis).
 */

export function calculateVortexForce(matchData) {
    const { history, current } = matchData.odds || { history: [], current: null };

    if (!history.length || !current) {
        return { level: 'neutral', force: 0, status: 'NO_VORTEX' };
    }

    // Force = Acceleration of Implied Probability
    // Measures how FAST the money is moving the odds
    const openProb = 1 / history[0].home;
    const currentProb = 1 / current.home;

    const delta = currentProb - openProb;
    const timeFrame = history.length; // Approximate time steps
    const velocity = delta / (timeFrame || 1);

    // Vortex Levels
    let level = 'neutral';
    let status = 'BALANCED';
    const force = Math.abs(velocity * 100);

    if (force > 5.0) {
        level = 'critical';
        status = delta > 0 ? 'VORTEX_BULL' : 'VORTEX_BEAR';
    } else if (force > 2.0) {
        level = 'significant';
        status = delta > 0 ? 'STRONG_INFLOW' : 'STRONG_OUTFLOW';
    }

    return {
        level,
        force: Number(force.toFixed(2)),
        status,
        message: status === 'VORTEX_BULL' ? 'Vórtice Profesional detectado a favor del local' :
            status === 'VORTEX_BEAR' ? 'Fuerza masiva en contra del local' : 'Flujo de capital disperso'
    };
}
