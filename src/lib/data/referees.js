export const REFEREE_DATABASE = {
    // English Premier League
    'Michael Oliver': { strictness: 'high', cardFrequency: 'high', homeBias: 1.02, description: 'Estricto con el contacto físico.' },
    'Anthony Taylor': { strictness: 'medium', cardFrequency: 'high', homeBias: 1.05, description: 'Propenso a tarjetas rojas en partidos grandes.' },
    'Simon Hooper': { strictness: 'low', cardFrequency: 'low', homeBias: 1.00, description: 'Deja jugar, pocos cortes.' },

    // La Liga
    'Mateu Lahoz': { strictness: 'high', cardFrequency: 'very_high', homeBias: 1.08, description: 'Protagonista, muchas tarjetas por protestar.' },
    'Gil Manzano': { strictness: 'high', cardFrequency: 'high', homeBias: 1.03, description: 'Riguroso en el área.' },
    'Soto Grado': { strictness: 'medium', cardFrequency: 'medium', homeBias: 1.01, description: 'Equilibrado.' },

    // Default Profile
    'Unknown': { strictness: 'medium', cardFrequency: 'medium', homeBias: 1.00, description: 'Sin datos históricos suficientes.' }
};

export function getRefereeProfile(refereeName) {
    if (!refereeName) return REFEREE_DATABASE['Unknown'];
    const ref = Object.keys(REFEREE_DATABASE).find(r => refereeName.includes(r));
    return ref ? REFEREE_DATABASE[ref] : REFEREE_DATABASE['Unknown'];
}
