// ========================================
// OmniBet AI - Master Orchestrator
// Coordinates all AI agents like a beehive (REAL DATA EDITION)
// ========================================

import {
    StatsScoutAgent,
    NewsScoutAgent,
    SocialSentimentAgent,
    OddsScoutAgent,
    WeatherScoutAgent
} from './scout-agents.js';

import {
    PlayerAnalystAgent,
    TeamAnalystAgent,
    H2HAnalystAgent,
    FormAnalystAgent,
    InjuryAnalystAgent
} from './analyst-agents.js';

import { SimulationAgent, TacticalAgent } from './monster-agents.js';
import { QualityAssurance } from './chatdev/quality-assurance.js';
import { StrategyDirector } from './chatdev/strategy-director.js';

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
            injury: new InjuryAnalystAgent(),
            // Monster Upgrade
            simulation: new SimulationAgent(),
            tactical: new TacticalAgent()
        };

        // ChatDev Swarm (Management Layer)
        this.qaDept = new QualityAssurance();
        this.strategyBoard = new StrategyDirector();
    }

    /**
     * Full match analysis - deploys all agents
     */
    async analyzeMatch(matchData) {
        // Prepare standardized match object
        const targetMatch = {
            matchId: matchData.id || matchData.matchId,
            sport: matchData.sport || 'soccer',
            league: matchData.league || 'eng.1',
            homeTeam: matchData.home?.name || 'Home',
            awayTeam: matchData.away?.name || 'Away',
            city: matchData.venue?.city || 'London', // Fallback for weather
            venue: matchData.venue?.name
        };

        console.log(`🐝 Orchestrator: Starting full analysis for ${targetMatch.homeTeam} vs ${targetMatch.awayTeam} (ID: ${targetMatch.matchId})`);
        const startTime = Date.now();

        // Phase 1: Deploy Scout Agents (parallel)
        console.log('📡 Phase 1: Deploying Scout Agents...');
        const scoutResults = await this.deployScouts(targetMatch);

        // Phase 2: Deploy Analyst Agents (parallel)
        console.log('🔬 Phase 2: Deploying Analyst Agents...');
        const analysisResults = await this.deployAnalysts(targetMatch, scoutResults);

        // Phase 3: Synthesize all data
        console.log('🧠 Phase 3: Synthesizing Intelligence...');
        const synthesis = await this.synthesize(scoutResults, analysisResults, targetMatch);

        // Phase 4: Generate Prediction
        console.log('🎯 Phase 4: Generating Prediction...');
        let prediction = this.generatePrediction(synthesis);

        // Phase 5: Quality Assurance Audit
        console.log('🕵️ Phase 5: Quality Assurance Audit...');
        const qaResult = this.qaDept.audit(prediction);

        if (!qaResult.passed) {
            console.warn(`⚠️ QA Audit Flagged Issues: ${qaResult.issues.join(', ')}`);
            // Sanction: Downgrade confidence
            prediction.confidence = 'Low';
            prediction.warning = "Audit flagged inconsistencies.";
        }

        // Phase 6: Strategy Director Review
        console.log('👔 Phase 6: Strategy Director Review...');
        // We use QA score (0-10) scaled to 100 as rough "Internal Confidence"
        const strategyVerdict = this.strategyBoard.evaluate(prediction, qaResult.score * 10);

        // Enhance prediction with Directive
        prediction = {
            ...prediction,
            strategicNote: strategyVerdict.strategicNote,
            action: strategyVerdict.action // PUBLISH, HOLD, REJECT
        };

        const duration = Date.now() - startTime;
        console.log(`✅ Analysis complete in ${duration}ms. Decision: ${strategyVerdict.action}`);

        return {
            match: targetMatch,
            scoutReports: scoutResults,
            analysis: analysisResults,
            synthesis,
            prediction, // Now contains CEO verdict
            chatDev: {
                qa: qaResult,
                strategy: strategyVerdict
            },
            metadata: {
                durationMs: duration,
                timestamp: new Date().toISOString(),
                confidenceLevel: prediction.confidence
            }
        };
    }

    /**
     * Deploy all scout agents in parallel
     */
    async deployScouts(match) {
        const tasks = [
            this.scouts.stats.execute({ matchId: match.matchId, sport: match.sport, league: match.league }),
            this.scouts.odds.execute({ matchId: match.matchId, sport: match.sport, league: match.league }),
            this.scouts.news.execute({ teamName: match.homeTeam }),
            this.scouts.social.execute({ matchId: match.matchId, sport: match.sport, league: match.league }), // Now uses consensus
            this.scouts.weather.execute({ city: match.city })
        ];

        const results = await Promise.all(tasks);

        return {
            stats: results[0],
            odds: results[1],
            news: results[2], // Home news
            social: results[3],
            weather: results[4]
        };
    }

    /**
     * Deploy all analyst agents in parallel
     */
    async deployAnalysts(match, scoutData) {
        const statsData = scoutData.stats?.success ? scoutData.stats.data : null;
        const oddsData = scoutData.odds?.success ? scoutData.odds.data : null;

        const tasks = [
            // Team Analysis (Real Stats)
            this.analysts.team.execute({ team: match.homeTeam, stats: statsData, odds: oddsData }),
            this.analysts.team.execute({ team: match.awayTeam, stats: statsData, odds: oddsData }),

            // H2H Analysis (Comparative)
            this.analysts.h2h.execute({
                homeStats: statsData ? statsData.home : null,
                awayStats: statsData ? statsData.away : null
            }),

            // Form Analysis (Passing standing/recent data if available from scouts to help FormAgent)
            this.analysts.form.execute({ team: match.homeTeam, lastNMatches: 5 }),

            // Injury Analysis (Placeholder as roster data is heavy)
            this.analysts.injury.execute({ team: match.homeTeam, injuries: [] }),

            // --- MONSTER AGENTS DEPLOYMENT ---
            // Simulation: Needs Stats to calculate xG and run Monte Carlo
            this.analysts.simulation.execute({
                homeStats: statsData?.home ? statsData.home.standing : null,
                awayStats: statsData?.away ? statsData.away.standing : null
            }),

            // Tactical: Needs Teams and potential Leaders/Style indicators
            this.analysts.tactical.execute({
                homeTeam: match.homeTeam,
                awayTeam: match.awayTeam,
                leaders: scoutData.stats?.success ? scoutData.stats.data.leaders : null
            })
        ];

        const results = await Promise.all(tasks);

        return {
            homeTeam: results[0],
            awayTeam: results[1],
            h2h: results[2],
            form: results[3],
            injury: results[4],
            simulation: results[5],
            tactical: results[6]
        };
    }

    /**
     * Synthesize all gathered intelligence
     */
    async synthesize(scoutData, analysisData, match) {
        const factors = [];
        let homeScore = 50;
        let awayScore = 50;

        // Factor 0: ESPN Odds (The Strongest Signal for Upcoming Matches)
        if (match.odds?.impliedProbabilities) {
            const imp = match.odds.impliedProbabilities;
            // Use implied probabilities as the BASE score instead of 50/50
            homeScore = imp.home || 50;
            awayScore = imp.away || 50;

            factors.push({
                name: 'Cuotas de Mercado (ESPN)',
                impact: homeScore > awayScore ? 'Home' : 'Away',
                weight: Math.abs(homeScore - awayScore).toFixed(1),
                detail: `Impl. Prob: Local ${homeScore.toFixed(0)}% - Visita ${awayScore.toFixed(0)}%`
            });
        }

        // Factor 1: Real Possession/Dominance
        if (scoutData.stats.success) {
            const hPoss = parseFloat(scoutData.stats.data.home.possession || 50);
            const diff = hPoss - 50;
            homeScore += diff * 0.5;
            awayScore -= diff * 0.5;

            factors.push({
                name: 'Dominio de Posesión',
                impact: diff > 0 ? 'Home' : 'Away',
                weight: Math.abs(diff * 0.5).toFixed(1),
                detail: `Local ${hPoss}% - Visita ${100 - hPoss}%`
            });
        }

        // Factor 2: Real Shots on Target
        if (scoutData.stats.success) {
            const hSOT = parseInt(scoutData.stats.data.home.shotsOnTarget || 0);
            const aSOT = parseInt(scoutData.stats.data.away.shotsOnTarget || 0);
            const sotDiff = hSOT - aSOT;

            homeScore += sotDiff * 2;
            awayScore -= sotDiff * 2;

            if (sotDiff !== 0) {
                factors.push({
                    name: 'Peligro de Gol (Tiros al arco)',
                    impact: sotDiff > 0 ? 'Home' : 'Away',
                    weight: Math.abs(sotDiff * 2).toFixed(1),
                    detail: `Local ${hSOT} - Visita ${aSOT}`
                });
            }
        }

        // Factor 3: Odds Consensus
        if (scoutData.social.success) {
            const hSup = parseFloat(scoutData.social.data.homeSupport || 33);
            const aSup = parseFloat(scoutData.social.data.awaySupport || 33);

            // If public is heavily skewed, usually follow (or fade if contrarian logic enabled)
            const consensusDiff = hSup - aSup;
            if (Math.abs(consensusDiff) > 10) {
                homeScore += consensusDiff * 0.2;
                awayScore -= consensusDiff * 0.2;
                factors.push({
                    name: 'Consenso Público',
                    impact: consensusDiff > 0 ? 'Home' : 'Away',
                    weight: Math.abs(consensusDiff * 0.2).toFixed(1),
                    detail: `Apoyo: ${hSup}% vs ${aSup}%`
                });
            }
        }

        // Factor 4: Home Advantage (Base)
        homeScore += 5;

        // --- MONSTER FACTORS ---

        // Factor 5: Tactical Multiplier
        if (analysisData.tactical?.success) {
            const tac = analysisData.tactical.data;
            // tacticalMultiplier > 1 favors Home
            const tacImpact = (tac.tacticalMultiplier - 1) * 20; // Scale effect, e.g. 1.05 -> +1 pt
            homeScore += tacImpact;
            awayScore -= tacImpact;

            if (Math.abs(tacImpact) > 1) {
                factors.push({
                    name: 'Ventaja Táctica',
                    impact: tacImpact > 0 ? 'Home' : 'Away',
                    weight: Math.abs(tacImpact).toFixed(1),
                    detail: tac.analysis
                });
            }
        }

        // Factor 6: Simulation Consensus (The "Truth" Serum)
        if (analysisData.simulation?.success) {
            const sim = analysisData.simulation.data;
            const simDiff = (sim.simulationStats.homeWinPct - sim.simulationStats.awayWinPct);

            // If Monte Carlo is very confident, pull score heavily
            homeScore += simDiff * 0.3;
            awayScore -= simDiff * 0.3;

            factors.push({
                name: 'Simulación Monte Carlo (1000x)',
                impact: simDiff > 0 ? 'Home' : 'Away',
                weight: Math.abs(simDiff * 0.3).toFixed(1),
                detail: `Predicción IA: ${sim.mostLikelyScore} (${sim.confidence})`
            });
        }

        // Calculate Probabilities
        const total = homeScore + awayScore;
        const normalizedHome = Math.min(90, Math.max(10, (homeScore / total) * 100));
        const normalizedAway = Math.min(90, Math.max(10, (awayScore / total) * 100));

        // SHARPENING: Reduce Draw if distinct favorite
        let finalHome = normalizedHome;
        let finalAway = normalizedAway;
        let finalDraw = 0;

        const gap = Math.abs(normalizedHome - normalizedAway);

        if (gap < 5) {
            // Dead heat -> High Draw
            finalDraw = 30;
            finalHome *= 0.85;
            finalAway *= 0.85;
        } else if (gap < 15) {
            // Competitive
            finalDraw = 22;
            const rem = 100 - finalDraw;
            const ratio = normalizedHome / (normalizedHome + normalizedAway);
            finalHome = rem * ratio;
            finalAway = rem * (1 - ratio);
        } else {
            // Clear Favorite -> Low Draw
            finalDraw = 12;
            const rem = 100 - finalDraw;
            const ratio = normalizedHome / (normalizedHome + normalizedAway);
            // Boost favorite slightly (Bandwagon effect / Momentum)
            if (normalizedHome > normalizedAway) finalHome += 5;
            else finalAway += 5;

            // Re-normalize
            const total2 = finalHome + finalAway + finalDraw;
            finalHome = (finalHome / total2) * 100;
            finalAway = (finalAway / total2) * 100;
            finalDraw = (finalDraw / total2) * 100;
        }

        const predictedScore = analysisData.simulation?.success
            ? analysisData.simulation.data.mostLikelyScore
            : "1-0"; // Fallback

        return {
            probabilities: {
                home: Math.round(finalHome),
                draw: Math.round(finalDraw),
                away: Math.round(finalAway)
            },
            scorePrediction: predictedScore,
            factors,
            keyInsights: factors.map(f => `${f.name}: ${f.detail}`)
        };
    }

    generatePrediction(synthesis) {
        const { home, draw, away } = synthesis.probabilities;
        const max = Math.max(home, draw, away);

        let outcome = 'DRAW';
        if (home === max) outcome = 'HOME_WIN';
        else if (away === max) outcome = 'AWAY_WIN';

        return {
            outcome,
            exactScore: synthesis.scorePrediction,
            confidence: max > 60 ? 'High' : max > 45 ? 'Medium' : 'Low',
            probabilities: synthesis.probabilities
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
