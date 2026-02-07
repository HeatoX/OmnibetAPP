
import { calculatePrediction } from './src/lib/ai-engine.js';

const mockMatch = {
    sport: 'football',
    home: { name: 'Real Madrid' },
    away: { name: 'Barcelona' }
};

// Caso 1: Ambos equipos iguales
const caseEqual = {
    homeForm: { recentGames: [{ result: 'W' }, { result: 'L' }] },
    awayForm: { recentGames: [{ result: 'W' }, { result: 'L' }] },
    h2h: []
};

// Caso 2: Local muy fuerte, visitante débil
const caseHomeStrong = {
    homeForm: { recentGames: [{ result: 'W' }, { result: 'W' }, { result: 'W' }] },
    awayForm: { recentGames: [{ result: 'L' }, { result: 'L' }, { result: 'L' }] },
    h2h: [{ result: 'W' }, { result: 'W' }]
};

// Caso 3: Muchas lesiones en el local
const caseHomeInjured = {
    homeForm: { recentGames: [{ result: 'W' }, { result: 'W' }] },
    awayForm: { recentGames: [{ result: 'W' }, { result: 'W' }] },
    homeInjuries: [{}, {}, {}, {}], // 4 lesionados
    leaders: [{ athlete: { id: 1 } }] // Un líder (no especificado como lesionado aquí pero suma peso)
};

console.log("--- TEST ORÁCULO V3.0 ---");
console.log("Igualdad:", calculatePrediction(mockMatch, caseEqual));
console.log("Local Fuerte:", calculatePrediction(mockMatch, caseHomeStrong));
console.log("Local Lesionado:", calculatePrediction(mockMatch, caseHomeInjured));
