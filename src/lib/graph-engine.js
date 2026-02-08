/**
 * Oráculo Quantum (V40.0) - Graph Neural Engine (Simulated)
 * Models team synergy and dependency as a connectivity graph.
 */

/**
 * Calculates the 'Centrality Impact' of players in a team.
 * In a real GNN, this would use pass graphs. Here we use a Weighted Dependency Model.
 */
export function calculateGraphStability(leaders = [], injuries = [], roster = []) {
    if (!leaders.length) return { stability: 1.0, centralNodes: [] };

    // 1. Identify Central Nodes (Hubs)
    // Leaders are treated as high-centrality nodes in the team's tactical graph.
    const hubs = leaders.map(l => ({
        name: l.leader?.toLowerCase() || "",
        type: l.name, // e.g., 'Goles', 'Asistencias'
        weight: l.name === 'Asistencias' ? 0.4 : 0.35, // Playmakers are usually more central hubs
        isAbsent: false
    }));

    // 2. Check for node failures (Injuries/Absences)
    let totalFailureImpact = 0;
    const absentNodes = [];

    hubs.forEach(hub => {
        const isInjured = injuries.some(inj =>
            (inj.athlete?.displayName?.toLowerCase() || "").includes(hub.name)
        );

        if (isInjured) {
            hub.isAbsent = true;
            totalFailureImpact += hub.weight;
            absentNodes.push(hub.name);
        }
    });

    // 3. Network Resilience Calculation
    // If a central hub fails, the network loses stability exponentially.
    const stability = Math.max(0.6, 1.0 - (totalFailureImpact * 1.2));

    return {
        stability: Number(stability.toFixed(2)),
        absentHubs: absentNodes,
        isFragmented: stability < 0.75,
        message: stability < 0.8 ? "Grafo Táctico Fragmentado: Pérdida de conexión crítica" : "Grafo Estable"
    };
}

/**
 * Beta: Synergy Coefficient between two players
 * Forecasts how well a specific matchup works.
 */
export function getSynergyCoefficient(p1, p2) {
    // Placeholder for future V40.x deep synergy learning
    return 1.15;
}
