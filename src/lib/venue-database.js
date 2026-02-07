/**
 * Venue Database Agent 🏟️
 * Knowledge of physical stadium characteristics
 * "The Groundskeeper" Agent
 */

export const VENUE_DB = {
    // High Altitude (Critical for stamina)
    'Estadio Hernando Siles': { altitude: 3637, type: 'grass', fortress: 10, notes: 'Extreme Altitude - Away team fatigue' },
    'Estadio Azteca': { altitude: 2200, type: 'grass', fortress: 8, notes: 'High Altitude' },
    'Empower Field at Mile High': { altitude: 1609, type: 'grass', fortress: 6, notes: 'Altitude advantage' },

    // Intimidating Atmospheres (Fortress)
    'Anfield': { fortress: 9, type: 'grass', notes: 'Massive Home Advantage' },
    'Signal Iduna Park': { fortress: 9, type: 'grass', notes: 'Yellow Wall - Review pressure' },
    'La Bombonera': { fortress: 10, type: 'grass', notes: 'Intimidating Audience' },
    'Ali Sami Yen': { fortress: 10, type: 'grass', notes: 'Welcome to Hell' },
    'Etihad Stadium': { fortress: 7, type: 'grass', notes: 'Fast Pitch - Possession Friendly' }, // Added for test

    // Artificial Turf (Ball moves faster, more injuries)
    'Lumen Field': { fortress: 8, type: 'turf', notes: 'Artificial Surface - Fast game' },
    'Mercedes-Benz Stadium': { fortress: 6, type: 'turf', notes: 'Fast track' },
};

export function analyzeVenue(venueName) {
    if (!venueName) return null;

    const venue = Object.entries(VENUE_DB).find(([name]) => venueName.includes(name));

    if (venue) {
        return {
            name: venue[0],
            data: venue[1],
            impact: venue[1].notes
        };
    }

    return null;
}
