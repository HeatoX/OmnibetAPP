// ========================================
// OmniBet AI - Multi-Agent Swarm System
// Coordinated AI agents for sports analysis
// ========================================

/**
 * Base Agent Class
 * All specialized agents inherit from this
 */
export class BaseAgent {
    constructor(name, type, priority = 5) {
        this.name = name;
        this.type = type; // 'scout', 'analyst', 'predictor'
        this.priority = priority;
        this.status = 'idle';
        this.lastUpdate = null;
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }

    async execute(task) {
        this.status = 'working';
        const start = Date.now();

        try {
            const result = await this.process(task);
            this.lastUpdate = new Date();
            this.status = 'complete';

            return {
                agent: this.name,
                success: true,
                data: result,
                duration: Date.now() - start,
                timestamp: this.lastUpdate
            };
        } catch (error) {
            this.status = 'error';
            return {
                agent: this.name,
                success: false,
                error: error.message,
                duration: Date.now() - start
            };
        }
    }

    async process(task) {
        throw new Error('process() must be implemented by subclass');
    }

    getCached(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, { data, timestamp: Date.now() });
    }
}

/**
 * Stats Scout Agent
 * Gathers statistical data from sports APIs
 */
export class StatsScoutAgent extends BaseAgent {
    constructor() {
        super('Stats Scout', 'scout', 10);
        this.sources = ['api-football', 'basketball-reference', 'espn'];
    }

    async process({ sport, teamId, matchId }) {
        // In production, this would call real APIs
        // For now, we simulate realistic data gathering

        const stats = {
            team: {
                form: this.generateForm(),
                goalsScored: this.randomStat(15, 35),
                goalsConceded: this.randomStat(10, 30),
                homeWinRate: this.randomStat(50, 80),
                awayWinRate: this.randomStat(30, 60),
                cleanSheets: this.randomStat(3, 12),
                avgPossession: this.randomStat(45, 65),
            },
            offense: {
                xG: this.randomFloat(1.2, 2.5),
                shotsPerGame: this.randomFloat(12, 18),
                shotsOnTarget: this.randomFloat(4, 8),
                bigChancesCreated: this.randomStat(2, 6),
                conversionRate: this.randomFloat(10, 25),
            },
            defense: {
                xGA: this.randomFloat(0.8, 1.8),
                tacklesPerGame: this.randomFloat(15, 25),
                interceptions: this.randomFloat(10, 18),
                cleanSheetRate: this.randomFloat(20, 50),
            },
            h2h: {
                totalMatches: this.randomStat(15, 40),
                wins: this.randomStat(5, 20),
                draws: this.randomStat(2, 10),
                losses: this.randomStat(3, 15),
            }
        };

        return stats;
    }

    generateForm() {
        const results = ['W', 'D', 'L'];
        return Array(5).fill(null).map(() =>
            results[Math.floor(Math.random() * 3)]
        );
    }

    randomStat(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    randomFloat(min, max) {
        return parseFloat((Math.random() * (max - min) + min).toFixed(2));
    }
}

/**
 * News Scout Agent
 * Monitors sports news for relevant information
 */
/**
 * News Scout Agent (REAL DATA via RSS)
 * Monitors sports news from RSS feeds (No key required)
 */
export class NewsScoutAgent extends BaseAgent {
    constructor() {
        super('News Scout', 'scout', 9);
        this.feeds = [
            'https://www.espn.com/espn/rss/news',
            'http://feeds.bbci.co.uk/sport/football/rss.xml',
            'https://api.foxsports.com/v1/rss?partnerKey=zBaFxRyGKCfxBagJG9b8pqLyndmvo7UU'
        ];
    }

    async process({ teamName, playerNames = [] }) {
        const newsItems = [];
        // Normalizar nombres para búsqueda
        const keywords = [teamName, ...playerNames].map(k => k?.toLowerCase()).filter(Boolean);

        try {
            // Fetch all feeds in parallel
            const feedPromises = this.feeds.map(url => this.fetchRSS(url));
            const feedResults = await Promise.allSettled(feedPromises);

            feedResults.forEach(res => {
                if (res.status === 'fulfilled') {
                    newsItems.push(...res.value);
                }
            });

            // Filter news relevant to the match
            const relevantNews = newsItems.filter(item => {
                const text = (item.title + ' ' + item.description).toLowerCase();
                return keywords.some(k => text.includes(k));
            });

            // Analyze sentiment of relevant news
            const sentiment = this.analyzeSentiment(relevantNews);

            return {
                source: 'Global Sports RSS',
                relevantArticles: relevantNews.slice(0, 5), // Top 5 relevant
                teamNews: relevantNews.filter(n => n.title.toLowerCase().includes(teamName.toLowerCase())),
                sentiment
            };

        } catch (error) {
            console.error('News Agent Error:', error);
            return { success: false, error: 'News Fetch Failed' };
        }
    }

    async fetchRSS(url) {
        try {
            // Use a CORS proxy if needed in browser, or direct fetch in Node
            // For this implementation, we assume a server-side route or open CORS
            // Using a public CORS proxy for demo purposes if client-side
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
            const res = await fetch(proxyUrl);
            const data = await res.json();

            if (!data.contents) return [];

            // Simple XML Parsing involves regex or DOMParser
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data.contents, "text/xml");
            const items = Array.from(xmlDoc.querySelectorAll("item"));

            return items.map(item => ({
                title: item.querySelector("title")?.textContent || '',
                description: item.querySelector("description")?.textContent || '',
                link: item.querySelector("link")?.textContent || '',
                pubDate: item.querySelector("pubDate")?.textContent || '',
                source: 'RSS Feed'
            }));

        } catch (e) {
            return [];
        }
    }

    analyzeSentiment(articles) {
        let score = 0;
        const positiveWords = ['win', 'victory', 'return', 'fit', 'ready', 'success', 'contract', 'promising'];
        const negativeWords = ['injury', 'out', 'doubt', 'loss', 'crisis', 'sacked', 'ban', 'fine'];

        articles.forEach(article => {
            const text = (article.title + ' ' + article.description).toLowerCase();
            positiveWords.forEach(w => { if (text.includes(w)) score += 1; });
            negativeWords.forEach(w => { if (text.includes(w)) score -= 2; }); // Negative news weighs more
        });

        return {
            score,
            label: score > 2 ? 'positive' : score < -2 ? 'negative' : 'neutral'
        };
    }
}

/**
 * Social Sentiment Agent
 * Analyzes social media for team/player sentiment
 */
export class SocialSentimentAgent extends BaseAgent {
    constructor() {
        super('Social Sentiment', 'scout', 7);
    }

    async process({ teamName, hashtags = [] }) {
        // Simulated social media analysis
        const mentions = this.randomStat(1000, 50000);
        const positivePercentage = 40 + Math.random() * 40;
        const negativePercentage = 10 + Math.random() * 30;
        const neutralPercentage = 100 - positivePercentage - negativePercentage;

        const trendingTopics = [
            'Forma reciente del equipo',
            'Alineación esperada',
            'Enfrentamiento clave',
            'Lesiones reportadas',
            'Declaraciones del técnico'
        ];

        return {
            team: teamName,
            totalMentions: mentions,
            sentiment: {
                positive: positivePercentage.toFixed(1),
                negative: negativePercentage.toFixed(1),
                neutral: neutralPercentage.toFixed(1),
                score: ((positivePercentage - negativePercentage) / 100).toFixed(2)
            },
            trending: trendingTopics.slice(0, 3),
            fanConfidence: positivePercentage > 60 ? 'high' : positivePercentage > 40 ? 'medium' : 'low',
            momentum: positivePercentage > 55 ? 'positive' : positivePercentage < 45 ? 'negative' : 'stable',
            topEmojis: ['⚽', '🔥', '💪', '🏆', '😤'].slice(0, 3)
        };
    }

    randomStat(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

/**
 * Odds Scout Agent
 * Monitors and compares odds from multiple bookmakers
 */
export class OddsScoutAgent extends BaseAgent {
    constructor() {
        super('Odds Scout', 'scout', 10);
        this.bookmakers = [
            'Bet365', 'Betfair', 'William Hill', 'Pinnacle',
            'Unibet', '1xBet', 'Betway', 'Bwin'
        ];
    }

    async process({ matchId, market = '1X2' }) {
        const odds = {};

        // Generate realistic odds from multiple bookmakers
        const baseHomeOdds = 1.5 + Math.random() * 2;
        const baseDrawOdds = 3 + Math.random() * 1.5;
        const baseAwayOdds = 2 + Math.random() * 3;

        this.bookmakers.forEach(bookmaker => {
            const variance = () => (Math.random() - 0.5) * 0.2;
            odds[bookmaker] = {
                home: (baseHomeOdds + variance()).toFixed(2),
                draw: (baseDrawOdds + variance()).toFixed(2),
                away: (baseAwayOdds + variance()).toFixed(2),
                timestamp: new Date().toISOString()
            };
        });

        // Find best odds
        const bestOdds = {
            home: { value: 0, bookmaker: '' },
            draw: { value: 0, bookmaker: '' },
            away: { value: 0, bookmaker: '' }
        };

        Object.entries(odds).forEach(([bookmaker, values]) => {
            ['home', 'draw', 'away'].forEach(outcome => {
                if (parseFloat(values[outcome]) > bestOdds[outcome].value) {
                    bestOdds[outcome] = {
                        value: parseFloat(values[outcome]),
                        bookmaker
                    };
                }
            });
        });

        // Calculate implied probabilities
        const avgHome = Object.values(odds).reduce((sum, o) => sum + parseFloat(o.home), 0) / this.bookmakers.length;
        const avgDraw = Object.values(odds).reduce((sum, o) => sum + parseFloat(o.draw), 0) / this.bookmakers.length;
        const avgAway = Object.values(odds).reduce((sum, o) => sum + parseFloat(o.away), 0) / this.bookmakers.length;

        return {
            market,
            odds,
            bestOdds,
            averageOdds: {
                home: avgHome.toFixed(2),
                draw: avgDraw.toFixed(2),
                away: avgAway.toFixed(2)
            },
            impliedProbability: {
                home: ((1 / avgHome) * 100).toFixed(1),
                draw: ((1 / avgDraw) * 100).toFixed(1),
                away: ((1 / avgAway) * 100).toFixed(1)
            },
            overround: (((1 / avgHome) + (1 / avgDraw) + (1 / avgAway)) * 100 - 100).toFixed(2) + '%'
        };
    }

    randomStat(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

/**
 * Weather Scout Agent
 * Gathers weather data for match venues
 */
/**
 * Weather Scout Agent (REAL DATA)
 * Gathers weather data using OpenMeteo (No key required)
 */
export class WeatherScoutAgent extends BaseAgent {
    constructor() {
        super('Weather Scout', 'scout', 5);
        this.geocodingUrl = 'https://geocoding-api.open-meteo.com/v1/search';
        this.weatherUrl = 'https://api.open-meteo.com/v1/forecast';
    }

    async process({ city, venue, matchTime }) {
        if (!city) return { success: false, reason: 'No city provided' };

        try {
            // 1. Geocode City
            const geoRes = await fetch(`${this.geocodingUrl}?name=${encodeURIComponent(city)}&count=1&language=es&format=json`);
            const geoData = await geoRes.json();

            if (!geoData.results?.length) {
                return { success: false, reason: 'City not found' };
            }

            const { latitude, longitude, name, country } = geoData.results[0];

            // 2. Get Weather Forecast
            const weatherRes = await fetch(
                `${this.weatherUrl}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m&forecast_days=1`
            );
            const weatherData = await weatherRes.json();
            const current = weatherData.current;

            // 3. Analyze Impact
            const impact = this.analyzeImpact(current);

            return {
                source: 'OpenMeteo (Real-Time)',
                location: { city: name, country, venue },
                conditions: {
                    temp: current.temperature_2m,
                    humidity: current.relative_humidity_2m,
                    windSpeed: current.wind_speed_10m,
                    precipitation: current.precipitation,
                    rain: current.rain
                },
                impact
            };

        } catch (error) {
            console.error('Weather Agent Error:', error);
            // Fallback to neutral if API fails
            return { success: false, error: 'Weather API Error' };
        }
    }

    analyzeImpact(weather) {
        let favorsSide = 'Neutral';
        let riskFactor = 'low';
        let playStyle = 'Standard';

        // Heavy Rain (>2mm)
        if (weather.rain > 2.0) {
            playStyle = 'Physical/Direct';
            favorsSide = 'Underdog'; // Chaos favors the weaker team often
            riskFactor = 'high';
        }

        // High Wind (>25 km/h)
        if (weather.wind_speed_10m > 25) {
            playStyle = 'Low Passing';
            riskFactor = 'medium';
        }

        // Extreme Heat (>30C) or Cold (<0C)
        if (weather.temperature_2m > 30 || weather.temperature_2m < 0) {
            riskFactor = 'medium';
            playStyle = 'Slow Tempo';
        }

        return { favorsSide, riskFactor, playStyle };
    }
}

/**
 * Referee Scout Agent
 * Analyzes referee strictness and bias
 */
export class RefereeScoutAgent extends BaseAgent {
    constructor() {
        super('Referee Scout', 'scout', 6);
    }

    async process({ refereeName }) {
        // Dynamic import to avoid circular dependencies if any
        const { getRefereeProfile } = await import('../data/referees');
        const profile = getRefereeProfile(refereeName);

        return {
            name: refereeName || 'Árbitro sin asignar',
            profile,
            impact: {
                cardRisk: profile.cardFrequency === 'high' || profile.cardFrequency === 'very_high' ? 'High' : 'Normal',
                penaltyRisk: profile.strictness === 'high' ? 'Elevado' : 'Estándar',
                history: profile.description
            }
        };
    }
}

export default {
    BaseAgent,
    StatsScoutAgent,
    NewsScoutAgent,
    SocialSentimentAgent,
    OddsScoutAgent,
    WeatherScoutAgent,
    RefereeScoutAgent
};
