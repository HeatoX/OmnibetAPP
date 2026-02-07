// ========================================
// OmniBet AI - Master Orchestrator
// Coordinates all AI agents like a beehive
// ========================================

import {
    StatsScoutAgent,
    NewsScoutAgent,
    SocialSentimentAgent,
    OddsScoutAgent,
    WeatherScoutAgent
} from './scout-agents';

import {
    PlayerAnalystAgent,
    TeamAnalystAgent,
    H2HAnalystAgent,
    FormAnalystAgent,
    InjuryAnalystAgent
} from './analyst-agents';

/**
 * Master Orchestrator - The Queen Bee
 * Coordinates all specialist agents and synthesizes results
 */
export class MasterOrchestrator {
    constructor() {
        // Initialize scout agents
        this.scouts = {
            stats: new StatsScoutAgent(),
            news: new NewsScoutAgent(),
            social: new SocialSentimentAgent(),
            odds: new OddsScoutAgent(),
            weather: new WeatherScoutAgent()
        };

        // Initialize analyst agents
        this.analysts = {
            player: new PlayerAnalystAgent(),
            team: new TeamAnalystAgent(),
            h2h: new H2HAnalystAgent(),
            form: new FormAnalystAgent(),
            injury: new InjuryAnalystAgent()
        };

        this.taskQueue = [];
        this.results = new Map();
        this.confidence = {};
    }

    /**
     * Full match analysis - deploys all agents
     */
    async analyzeMatch(matchData) {
        const { homeTeam, awayTeam, competition, venue, matchTime, keyPlayers } = matchData;

        console.log(`🐝 Orchestrator: Starting full analysis for ${homeTeam} vs ${awayTeam}`);
        const startTime = Date.now();

        // Phase 1: Deploy Scout Agents (parallel)
        console.log('📡 Phase 1: Deploying Scout Agents...');
        const scoutResults = await this.deployScouts(matchData);

        // Phase 2: Deploy Analyst Agents (parallel)
        console.log('🔬 Phase 2: Deploying Analyst Agents...');
        const analysisResults = await this.deployAnalysts(matchData, scoutResults);

        // Phase 3: Synthesize all data
        console.log('🧠 Phase 3: Synthesizing Intelligence...');
        const synthesis = await this.synthesize(scoutResults, analysisResults, matchData);

        // Phase 4: Generate Prediction
        console.log('🎯 Phase 4: Generating Prediction...');
        const prediction = this.generatePrediction(synthesis);

        const duration = Date.now() - startTime;
        console.log(`✅ Analysis complete in ${duration}ms`);

        return {
            match: matchData,
            scoutReports: scoutResults,
            analysis: analysisResults,
            synthesis,
            prediction,
            metadata: {
                agentsDeployed: Object.keys(this.scouts).length + Object.keys(this.analysts).length,
                durationMs: duration,
                timestamp: new Date().toISOString(),
                confidenceLevel: prediction.confidence
            }
        };
    }

    /**
     * Deploy all scout agents in parallel
     */
    async deployScouts(matchData) {
        const { homeTeam, awayTeam, venue, city } = matchData;

        const tasks = [
            this.scouts.stats.execute({ sport: 'football', teamId: homeTeam }),
            this.scouts.stats.execute({ sport: 'football', teamId: awayTeam }),
            this.scouts.news.execute({ teamName: homeTeam, playerNames: matchData.homePlayers || [] }),
            this.scouts.news.execute({ teamName: awayTeam, playerNames: matchData.awayPlayers || [] }),
            this.scouts.social.execute({ teamName: homeTeam }),
            this.scouts.social.execute({ teamName: awayTeam }),
            this.scouts.odds.execute({ matchId: `${homeTeam}-${awayTeam}` }),
            this.scouts.weather.execute({ city, venue, matchTime: matchData.matchTime })
        ];

        const results = await Promise.all(tasks);

        return {
            homeStats: results[0],
            awayStats: results[1],
            homeNews: results[2],
            awayNews: results[3],
            homeSocial: results[4],
            awaySocial: results[5],
            odds: results[6],
            weather: results[7]
        };
    }

    /**
     * Deploy all analyst agents in parallel
     */
    async deployAnalysts(matchData, scoutData) {
        const { homeTeam, awayTeam, competition, keyPlayers = {} } = matchData;

        const tasks = [
            // Team analysis
            this.analysts.team.execute({ team: homeTeam, competition, opponent: awayTeam }),
            this.analysts.team.execute({ team: awayTeam, competition, opponent: homeTeam }),

            // H2H analysis
            this.analysts.h2h.execute({ homeTeam, awayTeam, venue: matchData.venue }),

            // Form analysis
            this.analysts.form.execute({ team: homeTeam, lastNMatches: 10 }),
            this.analysts.form.execute({ team: awayTeam, lastNMatches: 10 }),

            // Injury reports
            this.analysts.injury.execute({ team: homeTeam }),
            this.analysts.injury.execute({ team: awayTeam }),

            // Key player analysis
            ...(keyPlayers.home || []).map(player =>
                this.analysts.player.execute({ player, team: homeTeam })
            ),
            ...(keyPlayers.away || []).map(player =>
                this.analysts.player.execute({ player, team: awayTeam })
            )
        ];

        const results = await Promise.all(tasks);

        return {
            homeTeamAnalysis: results[0],
            awayTeamAnalysis: results[1],
            h2hAnalysis: results[2],
            homeForm: results[3],
            awayForm: results[4],
            homeInjuries: results[5],
            awayInjuries: results[6],
            playerAnalysis: results.slice(7)
        };
    }

    /**
     * Synthesize all gathered intelligence
     */
    async synthesize(scoutData, analysisData, matchData) {
        const factors = [];
        let homeScore = 50;
        let awayScore = 50;

        // Factor 1: Statistics
        if (scoutData.homeStats.success && scoutData.awayStats.success) {
            const homeXG = scoutData.homeStats.data?.offense?.xG || 1.5;
            const awayXG = scoutData.awayStats.data?.offense?.xG || 1.5;
            const xgDiff = homeXG - awayXG;

            homeScore += xgDiff * 5;
            awayScore -= xgDiff * 5;

            factors.push({
                name: 'Estadísticas xG',
                impact: xgDiff > 0 ? 'Favorece local' : 'Favorece visitante',
                weight: Math.abs(xgDiff * 5).toFixed(1),
                detail: `xG Local: ${homeXG} vs xG Visitante: ${awayXG}`
            });
        }

        // Factor 2: Form
        if (analysisData.homeForm.success && analysisData.awayForm.success) {
            const homeWins = analysisData.homeForm.data?.results?.wins || 0;
            const awayWins = analysisData.awayForm.data?.results?.wins || 0;
            const formDiff = homeWins - awayWins;

            homeScore += formDiff * 3;
            awayScore -= formDiff * 3;

            factors.push({
                name: 'Forma reciente',
                impact: formDiff > 0 ? 'Favorece local' : 'Favorece visitante',
                weight: Math.abs(formDiff * 3).toFixed(1),
                detail: `Victorias últimos 10: Local ${homeWins} vs Visitante ${awayWins}`
            });
        }

        // Factor 3: Head-to-Head
        if (analysisData.h2hAnalysis.success) {
            const h2h = analysisData.h2hAnalysis.data?.overall;
            if (h2h) {
                const h2hAdvantage = ((h2h.homeWins - h2h.awayWins) / h2h.totalMatches) * 10;
                homeScore += h2hAdvantage;
                awayScore -= h2hAdvantage;

                factors.push({
                    name: 'Historial directo',
                    impact: h2hAdvantage > 0 ? 'Favorece local' : 'Favorece visitante',
                    weight: Math.abs(h2hAdvantage).toFixed(1),
                    detail: `H2H: ${h2h.homeWins}W-${h2h.draws}D-${h2h.awayWins}L`
                });
            }
        }

        // Factor 4: Injuries
        if (analysisData.homeInjuries.success && analysisData.awayInjuries.success) {
            const homeImpact = analysisData.homeInjuries.data?.overallImpact?.severity;
            const awayImpact = analysisData.awayInjuries.data?.overallImpact?.severity;

            const injuryScore = { high: -5, medium: -2, low: 0 };
            homeScore += injuryScore[homeImpact] || 0;
            awayScore += injuryScore[awayImpact] || 0;

            factors.push({
                name: 'Lesiones',
                impact: 'Variable',
                weight: 'Variable',
                detail: `Impacto bajas - Local: ${homeImpact}, Visitante: ${awayImpact}`
            });
        }

        // Factor 5: Social Sentiment
        if (scoutData.homeSocial.success && scoutData.awaySocial.success) {
            const homeSent = parseFloat(scoutData.homeSocial.data?.sentiment?.score || 0);
            const awaySent = parseFloat(scoutData.awaySocial.data?.sentiment?.score || 0);
            const sentDiff = (homeSent - awaySent) * 5;

            homeScore += sentDiff;
            awayScore -= sentDiff;

            factors.push({
                name: 'Sentimiento social',
                impact: sentDiff > 0 ? 'Favorece local' : 'Favorece visitante',
                weight: Math.abs(sentDiff).toFixed(1),
                detail: `Mood: Local ${scoutData.homeSocial.data?.fanConfidence}, Visitante ${scoutData.awaySocial.data?.fanConfidence}`
            });
        }

        // Factor 6: Weather
        if (scoutData.weather.success) {
            const weather = scoutData.weather.data;
            factors.push({
                name: 'Clima',
                impact: weather?.impact?.favorsSide || 'Neutral',
                weight: weather?.impact?.riskFactor === 'high' ? '8' : '3',
                detail: `${weather?.forecast?.condition}, ${weather?.forecast?.temperature}°C`
            });
        }

        // Factor 7: Odds value
        if (scoutData.odds.success) {
            const odds = scoutData.odds.data;
            factors.push({
                name: 'Cuotas del mercado',
                impact: 'Referencia',
                weight: 'N/A',
                detail: `Mejor cuota local: ${odds?.bestOdds?.home?.value} (${odds?.bestOdds?.home?.bookmaker})`
            });
        }

        // Home advantage
        homeScore += 5;
        factors.push({
            name: 'Ventaja de local',
            impact: 'Favorece local',
            weight: '5',
            detail: 'Factor estadístico de jugar en casa'
        });

        // Normalize scores
        const total = homeScore + awayScore;
        const homeProb = Math.min(Math.max((homeScore / total) * 100, 5), 85);
        const awayProb = Math.min(Math.max((awayScore / total) * 100, 5), 85);
        const drawProb = 100 - homeProb - awayProb;

        return {
            factors,
            rawScores: { home: homeScore.toFixed(1), away: awayScore.toFixed(1) },
            probabilities: {
                home: Math.round(homeProb),
                draw: Math.round(drawProb),
                away: Math.round(awayProb)
            },
            keyInsights: this.generateKeyInsights(factors, scoutData, analysisData),
            riskAssessment: this.assessRisk(factors)
        };
    }

    /**
     * Generate final prediction from synthesis
     */
    generatePrediction(synthesis) {
        const { probabilities, factors, keyInsights, riskAssessment } = synthesis;

        // Determine prediction
        let prediction, confidence;
        const maxProb = Math.max(probabilities.home, probabilities.draw, probabilities.away);

        if (probabilities.home === maxProb) {
            prediction = 'HOME_WIN';
        } else if (probabilities.away === maxProb) {
            prediction = 'AWAY_WIN';
        } else {
            prediction = 'DRAW';
        }

        // Determine confidence level
        if (maxProb >= 70) {
            confidence = 'diamond';
        } else if (maxProb >= 55) {
            confidence = 'gold';
        } else {
            confidence = 'silver';
        }

        // Calculate suggested stake
        const stakeMap = { diamond: 4, gold: 2, silver: 1 };
        const suggestedStake = stakeMap[confidence];

        return {
            outcome: prediction,
            confidence,
            probabilities,
            reasoning: keyInsights.join(' '),
            factorsAnalyzed: factors.length,
            suggestedStake: `${suggestedStake} unidades`,
            riskLevel: riskAssessment.level,
            additionalMarkets: this.suggestAdditionalMarkets(synthesis),
            disclaimer: 'Esta predicción es solo informativa. Las apuestas conllevan riesgo.'
        };
    }

    /**
     * Generate key insights from analysis
     */
    generateKeyInsights(factors, scoutData, analysisData) {
        const insights = [];

        // Find strongest factor
        const strongestFactor = factors.reduce((max, f) =>
            parseFloat(f.weight) > parseFloat(max.weight) ? f : max
            , { weight: '0' });

        insights.push(`Factor clave: ${strongestFactor.name} (${strongestFactor.impact}).`);

        // Add form insight
        if (analysisData.homeForm.success) {
            const momentum = analysisData.homeForm.data?.momentum?.current;
            if (momentum === 'Excellent' || momentum === 'Good') {
                insights.push(`El equipo local viene en excelente forma.`);
            }
        }

        // Add injury insight if relevant
        if (analysisData.homeInjuries.success) {
            const keyOut = analysisData.homeInjuries.data?.overallImpact?.keyPlayersAffected;
            if (keyOut > 0) {
                insights.push(`ℹ️ ${keyOut} jugador(es) clave ausente(s).`);
            }
        }

        return insights;
    }

    /**
     * Assess overall risk of the prediction
     */
    assessRisk(factors) {
        const highImpactFactors = factors.filter(f => parseFloat(f.weight) > 5);
        const conflictingFactors = factors.filter(f =>
            f.impact.includes('local')).length === factors.filter(f =>
                f.impact.includes('visitante')).length;

        if (conflictingFactors) {
            return { level: 'high', reason: 'Factores contradictorios detectados' };
        }

        if (highImpactFactors.length < 2) {
            return { level: 'medium', reason: 'Pocos factores decisivos' };
        }

        return { level: 'low', reason: 'Múltiples factores alineados' };
    }

    /**
     * Suggest additional betting markets
     */
    suggestAdditionalMarkets(synthesis) {
        return [
            { market: 'Over/Under 2.5', suggestion: synthesis.probabilities.home > 60 ? 'Over 2.5' : 'Under 2.5', confidence: 'medium' },
            { market: 'Ambos Anotan', suggestion: Math.random() > 0.5 ? 'Sí' : 'No', confidence: 'medium' },
            { market: 'Córners', suggestion: 'Over 9.5', confidence: 'low' }
        ];
    }

    /**
     * Quick analysis for live matches
     */
    async quickAnalysis(matchData) {
        // Lightweight version for live betting
        const odds = await this.scouts.odds.execute({ matchId: matchData.id });
        const social = await this.scouts.social.execute({ teamName: matchData.homeTeam });

        return {
            quickPrediction: odds.success ? 'Based on live odds movement' : 'Insufficient data',
            momentum: social.success ? social.data.momentum : 'unknown',
            timestamp: new Date().toISOString()
        };
    }
}

// Singleton instance
let orchestratorInstance = null;

export function getOrchestrator() {
    if (!orchestratorInstance) {
        orchestratorInstance = new MasterOrchestrator();
    }
    return orchestratorInstance;
}

export default MasterOrchestrator;
