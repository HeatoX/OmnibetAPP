/**
 * Oráculo V50.0 - Protocolo Observador: Motor Narrativo
 * Cuantifica el factor humano, rivalidades y "bestias negras".
 */

export const NARRATIVE_ENTITIES = {
    RIVALRY: { weight: 0.12, icon: '🔥', label: 'Rivalidad Histórica' },
    BOGEY_TEAM: { weight: 0.15, icon: '💀', label: 'Bestia Negra (Dominio)' },
    GRUDGE: { weight: 0.08, icon: '⚖️', label: 'Vendetta Personal (Coach)' },
    PRESSURE_MAX: { weight: 0.10, icon: '🏟️', label: 'Presión Mediática Máxima' }
};

/**
 * Analyzes the human narrative context of a match.
 */
export function getNarrativeWeight(homeName, awayName) {
    const h = homeName.toLowerCase();
    const a = awayName.toLowerCase();

    let multipliers = { home: 1.0, away: 1.0 };
    let activeFactors = [];

    // 1. Classical Rivalries (The "Known Lore")
    const clasiscos = [
        ['madrid', 'barcelona'],
        ['manchester city', 'liverpool'],
        ['inter', 'milan'],
        ['boca', 'river'],
        ['betis', 'sevilla']
    ];

    if (clasiscos.some(pair => (h.includes(pair[0]) && a.includes(pair[1])) || (h.includes(pair[1]) && a.includes(pair[0])))) {
        activeFactors.push({ ...NARRATIVE_ENTITIES.RIVALRY, detail: "Derbi / Clásico Detectado" });
        multipliers.home *= 1.05;
        multipliers.away *= 1.05; // En clasiscos el azar y la racha importan menos que el honor
    }

    // 2. Bogey Teams (Bestias Negras)
    const bogeyPairs = [
        { master: 'real madrid', victim: 'atletico' }, // Histórico
        { master: 'bayern', victim: 'barcelona' }
    ];

    bogeyPairs.forEach(pair => {
        if (h.includes(pair.master) && a.includes(pair.victim)) {
            activeFactors.push({ ...NARRATIVE_ENTITIES.BOGEY_TEAM, detail: `Dominio histórico de ${pair.master}` });
            multipliers.home *= 1.15;
        }
        if (a.includes(pair.master) && h.includes(pair.victim)) {
            activeFactors.push({ ...NARRATIVE_ENTITIES.BOGEY_TEAM, detail: `Dominio histórico de ${pair.master}` });
            multipliers.away *= 1.15;
        }
    });

    return {
        multipliers,
        factors: activeFactors,
        narrativeIntensity: activeFactors.length > 0 ? 'HIGH' : 'STANDARD'
    };
}
