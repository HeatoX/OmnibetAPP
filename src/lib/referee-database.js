/**
 * Referee Database Agent ⚖️
 * Static knowledge base of major league referees
 * "The Juez" Agent
 */

export const REFEREE_DB = {
    // La Liga
    'Mateu Lahoz': { strictness: 9, cardsPerGame: 5.2, bias: 'theatrics', description: 'Very strict, loves the spotlight' },
    'Gil Manzano': { strictness: 7, cardsPerGame: 4.5, bias: 'neutral', description: 'Balanced but firm' },
    'Hernández Hernández': { strictness: 8, cardsPerGame: 5.8, bias: 'home', description: 'High card frequency' },

    // Premier League
    'Michael Oliver': { strictness: 5, cardsPerGame: 3.1, bias: 'flow', description: 'Lets the game flow' },
    'Anthony Taylor': { strictness: 8, cardsPerGame: 4.2, bias: 'inconsistent', description: 'Strict on tactical fouls' },
    'Paul Tierney': { strictness: 6, cardsPerGame: 3.5, bias: 'neutral', description: 'Standard officiating' },

    // Generic Profiles (Fallback)
    'Strict Ref': { strictness: 8, cardsPerGame: 5.5, description: 'Statistically high card issuer' },
    'Lenient Ref': { strictness: 3, cardsPerGame: 2.5, description: 'Reluctant to book players' }
};

export function analyzeReferee(refName) {
    if (!refName) return null;

    // Fuzzy search
    const ref = Object.entries(REFEREE_DB).find(([name]) => refName.includes(name));

    if (ref) {
        return {
            name: ref[0],
            stats: ref[1],
            impact: ref[1].strictness > 7 ? 'High Card Risk 🟨' : 'Low Card Risk 🟩'
        };
    }

    return null;
}
