// ========================================
// OmniBet AI - Analyst Agents
// Deep analysis and pattern recognition
// ========================================

import { BaseAgent } from './scout-agents';

/**
 * Player Analyst Agent
 * Deep individual player analysis
 */
export class PlayerAnalystAgent extends BaseAgent {
    constructor() {
        super('Player Analyst', 'analyst', 9);
    }

    async process({ player, team, recentMatches = 5 }) {
        // Generate comprehensive player profile
        const profile = {
            basic: {
                name: player,
                team,
                position: this.inferPosition(player),
                age: 20 + Math.floor(Math.random() * 15),
                marketValue: `€${Math.floor(20 + Math.random() * 100)}M`,
                nationality: this.getRandomNationality()
            },

            currentForm: {
                rating: (6 + Math.random() * 3).toFixed(1),
                trend: Math.random() > 0.5 ? 'improving' : 'declining',
                consistency: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
                matchesPlayed: Math.floor(15 + Math.random() * 20)
            },

            physicalStatus: {
                fitnessLevel: Math.floor(70 + Math.random() * 30),
                fatigueIndex: Math.random().toFixed(2),
                minutesLast5: Array(5).fill(0).map(() => Math.floor(Math.random() * 91)),
                restDays: Math.floor(Math.random() * 7),
                injuryRisk: this.calculateInjuryRisk(),
                lastInjury: Math.random() > 0.7 ? {
                    type: ['Hamstring', 'Ankle', 'Knee', 'Muscle fatigue'][Math.floor(Math.random() * 4)],
                    daysAgo: Math.floor(30 + Math.random() * 60),
                    severity: ['Minor', 'Moderate'][Math.floor(Math.random() * 2)]
                } : null
            },

            recentPerformance: this.generateRecentPerformance(recentMatches),

            vsOpponent: {
                matches: Math.floor(3 + Math.random() * 10),
                goals: Math.floor(Math.random() * 6),
                assists: Math.floor(Math.random() * 4),
                avgRating: (6 + Math.random() * 2.5).toFixed(1),
                tendency: Math.random() > 0.5 ? 'performs well' : 'struggles'
            },

            predictions: {
                startingProbability: Math.floor(60 + Math.random() * 40),
                goalProbability: Math.floor(15 + Math.random() * 40),
                assistProbability: Math.floor(10 + Math.random() * 30),
                cardProbability: Math.floor(5 + Math.random() * 20),
                keyPassesPrediction: (1 + Math.random() * 3).toFixed(1),
                duelWinPrediction: Math.floor(45 + Math.random() * 25) + '%'
            },

            alerts: this.generateAlerts(player)
        };

        return profile;
    }

    inferPosition(playerName) {
        // Simple position inference for demo
        const positions = ['GK', 'CB', 'RB', 'LB', 'CDM', 'CM', 'CAM', 'RW', 'LW', 'ST'];
        return positions[Math.floor(Math.random() * positions.length)];
    }

    getRandomNationality() {
        const nationalities = ['Spain', 'Brazil', 'France', 'Germany', 'Argentina', 'England', 'Portugal', 'Italy'];
        return nationalities[Math.floor(Math.random() * nationalities.length)];
    }

    calculateInjuryRisk() {
        const risk = Math.random();
        if (risk > 0.8) return { level: 'high', percentage: Math.floor(60 + Math.random() * 30) };
        if (risk > 0.5) return { level: 'medium', percentage: Math.floor(30 + Math.random() * 30) };
        return { level: 'low', percentage: Math.floor(5 + Math.random() * 25) };
    }

    generateRecentPerformance(matches) {
        return Array(matches).fill(null).map((_, i) => ({
            matchNumber: i + 1,
            opponent: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'][i],
            minutesPlayed: Math.floor(60 + Math.random() * 31),
            rating: (5.5 + Math.random() * 4).toFixed(1),
            goals: Math.random() > 0.7 ? Math.floor(1 + Math.random() * 2) : 0,
            assists: Math.random() > 0.8 ? 1 : 0,
            keyPasses: Math.floor(Math.random() * 5),
            duelsWon: Math.floor(3 + Math.random() * 10),
            yellowCard: Math.random() > 0.85,
            redCard: Math.random() > 0.98
        }));
    }

    generateAlerts(player) {
        const alerts = [];

        if (Math.random() > 0.6) {
            alerts.push({
                type: 'fitness',
                severity: 'info',
                message: `${player} entrenó al 100% hoy`,
                impact: '+3% probabilidad de gol'
            });
        }

        if (Math.random() > 0.7) {
            alerts.push({
                type: 'tactical',
                severity: 'warning',
                message: `Posible cambio de posición en la alineación`,
                impact: 'Reclasificar predicciones'
            });
        }

        if (Math.random() > 0.85) {
            alerts.push({
                type: 'personal',
                severity: 'alert',
                message: `Rumores de conflicto con el técnico`,
                impact: '-5% rendimiento esperado'
            });
        }

        return alerts;
    }
}

/**
 * Team Analyst Agent
 * Team-level tactical analysis
 */
export class TeamAnalystAgent extends BaseAgent {
    constructor() {
        super('Team Analyst', 'analyst', 9);
    }

    async process({ team, competition, opponent }) {
        return {
            identity: {
                name: team,
                competition,
                manager: this.getRandomManager(),
                formation: this.getRandomFormation(),
                playStyle: this.getPlayStyle()
            },

            strength: {
                overall: Math.floor(70 + Math.random() * 25),
                attack: Math.floor(65 + Math.random() * 30),
                midfield: Math.floor(65 + Math.random() * 30),
                defense: Math.floor(65 + Math.random() * 30),
                depth: Math.floor(60 + Math.random() * 35)
            },

            form: {
                last5: this.generateFormString(),
                trend: Math.random() > 0.5 ? 'ascending' : 'descending',
                homeRecord: `${Math.floor(5 + Math.random() * 10)}W-${Math.floor(Math.random() * 5)}D-${Math.floor(Math.random() * 5)}L`,
                awayRecord: `${Math.floor(3 + Math.random() * 7)}W-${Math.floor(Math.random() * 6)}D-${Math.floor(2 + Math.random() * 6)}L`
            },

            tactical: {
                pressingIntensity: Math.floor(40 + Math.random() * 50),
                possessionStyle: Math.random() > 0.5 ? 'possession-based' : 'counter-attack',
                buildUpPlay: ['short', 'mixed', 'long'][Math.floor(Math.random() * 3)],
                defensiveLine: ['high', 'medium', 'deep'][Math.floor(Math.random() * 3)],
                setPieceStrength: Math.floor(50 + Math.random() * 45)
            },

            injuries: this.generateInjuryReport(),

            matchupVs: opponent ? {
                historicalAdvantage: Math.random() > 0.5 ? team : opponent,
                styleFavors: Math.random() > 0.5 ? team : opponent,
                keyBattles: this.generateKeyBattles()
            } : null,

            prediction: {
                expectedGoals: (0.8 + Math.random() * 2).toFixed(2),
                cleanSheetProbability: Math.floor(15 + Math.random() * 40),
                winProbability: Math.floor(25 + Math.random() * 50)
            }
        };
    }

    getRandomManager() {
        const managers = ['Carlo Ancelotti', 'Pep Guardiola', 'Jürgen Klopp', 'Diego Simeone', 'Xavi'];
        return managers[Math.floor(Math.random() * managers.length)];
    }

    getRandomFormation() {
        const formations = ['4-3-3', '4-4-2', '3-5-2', '4-2-3-1', '5-3-2', '4-1-4-1'];
        return formations[Math.floor(Math.random() * formations.length)];
    }

    getPlayStyle() {
        const styles = [
            'Posesión dominante',
            'Contraataque veloz',
            'Pressing alto',
            'Defensa sólida',
            'Juego directo',
            'Tiki-taka'
        ];
        return styles[Math.floor(Math.random() * styles.length)];
    }

    generateFormString() {
        return Array(5).fill(null).map(() =>
            ['W', 'D', 'L'][Math.floor(Math.random() * 3)]
        ).join('');
    }

    generateInjuryReport() {
        const count = Math.floor(Math.random() * 4);
        return Array(count).fill(null).map(() => ({
            player: `Player ${Math.floor(Math.random() * 30)}`,
            injury: ['Hamstring', 'ACL', 'Ankle', 'Muscle'][Math.floor(Math.random() * 4)],
            returnDate: Math.random() > 0.5 ? 'Doubtful' : 'Out',
            importance: ['starter', 'rotation', 'backup'][Math.floor(Math.random() * 3)]
        }));
    }

    generateKeyBattles() {
        return [
            { area: 'Midfield control', importance: 'Critical' },
            { area: 'Wing play', importance: 'High' },
            { area: 'Set pieces', importance: 'Medium' }
        ];
    }
}

/**
 * H2H (Head-to-Head) Analyst Agent
 */
export class H2HAnalystAgent extends BaseAgent {
    constructor() {
        super('H2H Analyst', 'analyst', 8);
    }

    async process({ homeTeam, awayTeam, venue }) {
        const totalMatches = Math.floor(20 + Math.random() * 30);
        const homeWins = Math.floor(totalMatches * (0.3 + Math.random() * 0.3));
        const draws = Math.floor((totalMatches - homeWins) * 0.3);
        const awayWins = totalMatches - homeWins - draws;

        return {
            overall: {
                totalMatches,
                homeWins,
                draws,
                awayWins,
                homeWinPercentage: ((homeWins / totalMatches) * 100).toFixed(1),
                awayWinPercentage: ((awayWins / totalMatches) * 100).toFixed(1)
            },

            atVenue: venue ? {
                matches: Math.floor(10 + Math.random() * 15),
                homeWinRate: Math.floor(40 + Math.random() * 35) + '%',
                avgGoals: (2 + Math.random() * 1.5).toFixed(1)
            } : null,

            recentMeetings: this.generateRecentMeetings(homeTeam, awayTeam, 5),

            trends: {
                btts: Math.floor(40 + Math.random() * 40) + '% of matches',
                over25: Math.floor(45 + Math.random() * 35) + '% of matches',
                avgTotalGoals: (2.2 + Math.random() * 1.3).toFixed(1),
                mostCommonScore: this.getRandomScore()
            },

            psychological: {
                dominantTeam: Math.random() > 0.5 ? homeTeam : awayTeam,
                bigMatchWinner: Math.random() > 0.5 ? homeTeam : awayTeam,
                nervousnessIndex: {
                    [homeTeam]: Math.floor(10 + Math.random() * 40),
                    [awayTeam]: Math.floor(10 + Math.random() * 40)
                }
            }
        };
    }

    generateRecentMeetings(home, away, count) {
        return Array(count).fill(null).map((_, i) => {
            const homeGoals = Math.floor(Math.random() * 4);
            const awayGoals = Math.floor(Math.random() * 4);
            return {
                date: `2024-${12 - i}-${Math.floor(1 + Math.random() * 28)}`,
                homeTeam: Math.random() > 0.5 ? home : away,
                awayTeam: Math.random() > 0.5 ? away : home,
                score: `${homeGoals}-${awayGoals}`,
                competition: ['League', 'Cup', 'Champions'][Math.floor(Math.random() * 3)]
            };
        });
    }

    getRandomScore() {
        const scores = ['1-1', '2-1', '1-0', '2-0', '0-0', '2-2'];
        return scores[Math.floor(Math.random() * scores.length)];
    }
}

/**
 * Form Analyst Agent
 * Analyzes recent performance trends
 */
export class FormAnalystAgent extends BaseAgent {
    constructor() {
        super('Form Analyst', 'analyst', 8);
    }

    async process({ team, lastNMatches = 10 }) {
        const matches = this.generateMatchHistory(team, lastNMatches);
        const stats = this.calculateFormStats(matches);

        return {
            team,
            period: `Last ${lastNMatches} matches`,

            results: {
                wins: stats.wins,
                draws: stats.draws,
                losses: stats.losses,
                form: matches.map(m => m.result).join(''),
                points: stats.wins * 3 + stats.draws,
                ppg: ((stats.wins * 3 + stats.draws) / lastNMatches).toFixed(2)
            },

            goals: {
                scored: stats.scored,
                conceded: stats.conceded,
                difference: stats.scored - stats.conceded,
                avgScored: (stats.scored / lastNMatches).toFixed(2),
                avgConceded: (stats.conceded / lastNMatches).toFixed(2),
                cleanSheets: stats.cleanSheets,
                failedToScore: stats.failedToScore
            },

            momentum: {
                current: this.calculateMomentum(matches),
                trend: this.analyzeTrend(matches),
                lastWin: this.findLastResult(matches, 'W'),
                lastLoss: this.findLastResult(matches, 'L')
            },

            homeAway: {
                homeForm: this.calculateSplitForm(matches, 'home'),
                awayForm: this.calculateSplitForm(matches, 'away')
            },

            confidence: {
                level: stats.wins > lastNMatches * 0.6 ? 'high' :
                    stats.wins > lastNMatches * 0.4 ? 'medium' : 'low',
                reasoning: this.generateFormReasoning(stats, lastNMatches)
            }
        };
    }

    generateMatchHistory(team, count) {
        return Array(count).fill(null).map((_, i) => {
            const result = ['W', 'D', 'L'][Math.floor(Math.random() * 3)];
            const scored = result === 'W' ? Math.floor(1 + Math.random() * 3) :
                result === 'D' ? Math.floor(Math.random() * 3) :
                    Math.floor(Math.random() * 2);
            const conceded = result === 'L' ? Math.floor(1 + Math.random() * 3) :
                result === 'D' ? scored :
                    Math.floor(Math.random() * 2);

            return {
                matchday: count - i,
                result,
                scored,
                conceded,
                venue: Math.random() > 0.5 ? 'home' : 'away'
            };
        });
    }

    calculateFormStats(matches) {
        return {
            wins: matches.filter(m => m.result === 'W').length,
            draws: matches.filter(m => m.result === 'D').length,
            losses: matches.filter(m => m.result === 'L').length,
            scored: matches.reduce((sum, m) => sum + m.scored, 0),
            conceded: matches.reduce((sum, m) => sum + m.conceded, 0),
            cleanSheets: matches.filter(m => m.conceded === 0).length,
            failedToScore: matches.filter(m => m.scored === 0).length
        };
    }

    calculateMomentum(matches) {
        const recent3 = matches.slice(0, 3);
        const points = recent3.reduce((sum, m) =>
            sum + (m.result === 'W' ? 3 : m.result === 'D' ? 1 : 0), 0
        );
        if (points >= 7) return 'Excellent';
        if (points >= 5) return 'Good';
        if (points >= 3) return 'Average';
        return 'Poor';
    }

    analyzeTrend(matches) {
        const first5 = matches.slice(5);
        const last5 = matches.slice(0, 5);

        const first5points = first5.reduce((sum, m) =>
            sum + (m.result === 'W' ? 3 : m.result === 'D' ? 1 : 0), 0
        );
        const last5points = last5.reduce((sum, m) =>
            sum + (m.result === 'W' ? 3 : m.result === 'D' ? 1 : 0), 0
        );

        if (last5points > first5points + 3) return '📈 Improving significantly';
        if (last5points > first5points) return '📈 Slight improvement';
        if (last5points < first5points - 3) return '📉 Declining significantly';
        if (last5points < first5points) return '📉 Slight decline';
        return '➡️ Stable';
    }

    findLastResult(matches, result) {
        const index = matches.findIndex(m => m.result === result);
        return index === -1 ? 'N/A' : `${index + 1} matches ago`;
    }

    calculateSplitForm(matches, venue) {
        const filtered = matches.filter(m => m.venue === venue);
        const wins = filtered.filter(m => m.result === 'W').length;
        const total = filtered.length;
        return {
            record: `${wins}W in ${total} matches`,
            winRate: total > 0 ? ((wins / total) * 100).toFixed(0) + '%' : 'N/A'
        };
    }

    generateFormReasoning(stats, total) {
        const winRate = stats.wins / total;
        if (winRate > 0.7) return 'Excelente racha, equipo en forma óptima';
        if (winRate > 0.5) return 'Buen momento, rendimiento consistente';
        if (winRate > 0.3) return 'Forma irregular, resultados mixtos';
        return 'Mala racha, equipo en crisis de resultados';
    }
}

/**
 * Injury/Fitness Analyst Agent
 */
export class InjuryAnalystAgent extends BaseAgent {
    constructor() {
        super('Injury Analyst', 'analyst', 9);
    }

    async process({ team, squad = [] }) {
        const injuryReport = {
            team,
            assessmentDate: new Date().toISOString(),

            confirmed: this.generateInjuryList(2, 'Out'),
            doubtful: this.generateInjuryList(1, 'Doubtful'),
            returning: this.generateInjuryList(1, 'Returning'),

            overallImpact: {
                severity: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
                percentageOut: Math.floor(Math.random() * 20) + '%',
                keyPlayersAffected: Math.floor(Math.random() * 3)
            },

            fatigueRisk: {
                highRiskPlayers: Math.floor(Math.random() * 4),
                matchCongestion: Math.random() > 0.5 ? 'Yes' : 'No',
                rotationExpected: Math.random() > 0.6 ? 'Likely' : 'Unlikely'
            },

            recommendation: this.generateRecommendation()
        };

        return injuryReport;
    }

    generateInjuryList(count, status) {
        return Array(count).fill(null).map(() => ({
            player: `Player ${Math.floor(Math.random() * 30)}`,
            injury: ['Hamstring strain', 'Ankle sprain', 'Muscle fatigue', 'Knee issue', 'Illness'][Math.floor(Math.random() * 5)],
            status,
            expectedReturn: status === 'Out' ? `${Math.floor(1 + Math.random() * 4)} weeks` :
                status === 'Doubtful' ? 'Match day decision' :
                    'Available for selection',
            importance: Math.floor(1 + Math.random() * 10) + '/10'
        }));
    }

    generateRecommendation() {
        const recs = [
            'Pocas bajas significativas, equipo casi al completo',
            'Ausencias en posiciones clave, considerar impacto',
            'Lista de bajas extensa, rendimiento podría verse afectado',
            'Jugadores clave de vuelta, moral alta esperada'
        ];
        return recs[Math.floor(Math.random() * recs.length)];
    }
}

export default {
    PlayerAnalystAgent,
    TeamAnalystAgent,
    H2HAnalystAgent,
    FormAnalystAgent,
    InjuryAnalystAgent
};
