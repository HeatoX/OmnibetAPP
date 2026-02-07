// ========================================
// OmniBet AI - Real Sports API Service
// Connects to live sports data providers
// ========================================

/**
 * API Configuration
 * In production, these would be in environment variables
 */
const API_CONFIG = {
    apiFootball: {
        baseUrl: 'https://v3.football.api-sports.io',
        // Get your free key at: https://www.api-football.com/
        key: process.env.NEXT_PUBLIC_API_FOOTBALL_KEY || 'demo_key'
    },
    theOddsApi: {
        baseUrl: 'https://api.the-odds-api.com/v4',
        // Get your free key at: https://the-odds-api.com/
        key: process.env.NEXT_PUBLIC_ODDS_API_KEY || 'demo_key'
    },
    newsApi: {
        baseUrl: 'https://newsapi.org/v2',
        // Get your free key at: https://newsapi.org/
        key: process.env.NEXT_PUBLIC_NEWS_API_KEY || 'demo_key'
    },
    openWeather: {
        baseUrl: 'https://api.openweathermap.org/data/2.5',
        // Get your free key at: https://openweathermap.org/
        key: process.env.NEXT_PUBLIC_OPENWEATHER_KEY || 'demo_key'
    }
};

/**
 * API Football Service
 * Professional football/soccer data
 */
export class ApiFootballService {
    constructor() {
        this.baseUrl = API_CONFIG.apiFootball.baseUrl;
        this.apiKey = API_CONFIG.apiFootball.key;
        this.isDemo = this.apiKey === 'demo_key';
    }

    async request(endpoint, params = {}) {
        if (this.isDemo) {
            return this.getMockData(endpoint, params);
        }

        const url = new URL(`${this.baseUrl}${endpoint}`);
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        try {
            const response = await fetch(url.toString(), {
                headers: {
                    'x-rapidapi-host': 'v3.football.api-sports.io',
                    'x-rapidapi-key': this.apiKey
                }
            });

            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('API Football error:', error);
            return this.getMockData(endpoint, params);
        }
    }

    // Live fixtures
    async getLiveFixtures() {
        return this.request('/fixtures', { live: 'all' });
    }

    // Today's fixtures
    async getTodayFixtures() {
        const today = new Date().toISOString().split('T')[0];
        return this.request('/fixtures', { date: today });
    }

    // Team statistics
    async getTeamStats(teamId, leagueId, season) {
        return this.request('/teams/statistics', { team: teamId, league: leagueId, season });
    }

    // Head-to-head
    async getH2H(teamId1, teamId2) {
        return this.request('/fixtures/headtohead', { h2h: `${teamId1}-${teamId2}` });
    }

    // Player statistics
    async getPlayerStats(playerId, season) {
        return this.request('/players', { id: playerId, season });
    }

    // Injuries
    async getInjuries(leagueId, season) {
        return this.request('/injuries', { league: leagueId, season });
    }

    // Predictions (API's own predictions)
    async getPredictions(fixtureId) {
        return this.request('/predictions', { fixture: fixtureId });
    }

    // Mock data for demo mode
    getMockData(endpoint, params) {
        const mockResponses = {
            '/fixtures': {
                response: this.generateMockFixtures()
            },
            '/teams/statistics': {
                response: this.generateMockTeamStats()
            },
            '/fixtures/headtohead': {
                response: this.generateMockH2H()
            },
            '/predictions': {
                response: this.generateMockPrediction()
            }
        };

        return mockResponses[endpoint] || { response: [] };
    }

    generateMockFixtures() {
        const teams = [
            { id: 1, name: 'Real Madrid', logo: '🏳️' },
            { id: 2, name: 'Barcelona', logo: '🔵🔴' },
            { id: 3, name: 'Manchester City', logo: '🔵' },
            { id: 4, name: 'Liverpool', logo: '🔴' },
            { id: 5, name: 'Bayern Munich', logo: '🔴⚪' },
            { id: 6, name: 'PSG', logo: '🔵🔴' }
        ];

        return Array(8).fill(null).map((_, i) => {
            const homeTeam = teams[i % teams.length];
            const awayTeam = teams[(i + 1) % teams.length];
            const isLive = Math.random() > 0.6;

            return {
                fixture: {
                    id: 1000 + i,
                    date: new Date().toISOString(),
                    status: {
                        short: isLive ? '1H' : 'NS',
                        elapsed: isLive ? Math.floor(Math.random() * 90) : null
                    }
                },
                league: {
                    id: 140,
                    name: 'La Liga',
                    country: 'Spain'
                },
                teams: {
                    home: homeTeam,
                    away: awayTeam
                },
                goals: {
                    home: isLive ? Math.floor(Math.random() * 3) : null,
                    away: isLive ? Math.floor(Math.random() * 3) : null
                }
            };
        });
    }

    generateMockTeamStats() {
        return {
            form: 'WWDWL',
            fixtures: {
                played: { home: 15, away: 14, total: 29 },
                wins: { home: 12, away: 8, total: 20 },
                draws: { home: 2, away: 3, total: 5 },
                loses: { home: 1, away: 3, total: 4 }
            },
            goals: {
                for: { total: { home: 35, away: 28, total: 63 } },
                against: { total: { home: 10, away: 18, total: 28 } }
            }
        };
    }

    generateMockH2H() {
        return Array(10).fill(null).map((_, i) => ({
            fixture: {
                id: 2000 + i,
                date: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            teams: {
                home: { name: 'Team A', winner: Math.random() > 0.5 },
                away: { name: 'Team B', winner: Math.random() > 0.5 }
            },
            goals: {
                home: Math.floor(Math.random() * 4),
                away: Math.floor(Math.random() * 4)
            }
        }));
    }

    generateMockPrediction() {
        return [{
            predictions: {
                winner: { name: 'Real Madrid' },
                percent: { home: '55%', draw: '25%', away: '20%' }
            },
            comparison: {
                form: { home: '80%', away: '70%' },
                att: { home: '85%', away: '75%' },
                def: { home: '75%', away: '70%' }
            }
        }];
    }
}

/**
 * The Odds API Service
 * Live betting odds from multiple bookmakers
 */
export class OddsApiService {
    constructor() {
        this.baseUrl = API_CONFIG.theOddsApi.baseUrl;
        this.apiKey = API_CONFIG.theOddsApi.key;
        this.isDemo = this.apiKey === 'demo_key';
    }

    async request(endpoint, params = {}) {
        if (this.isDemo) {
            return this.getMockOdds();
        }

        const url = new URL(`${this.baseUrl}${endpoint}`);
        url.searchParams.append('apiKey', this.apiKey);
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        try {
            const response = await fetch(url.toString());
            if (!response.ok) throw new Error(`Odds API Error: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Odds API error:', error);
            return this.getMockOdds();
        }
    }

    async getSportsOdds(sport = 'soccer_epl', markets = 'h2h', regions = 'eu') {
        return this.request(`/sports/${sport}/odds`, { markets, regions });
    }

    async getLiveOdds(sport = 'soccer_epl') {
        return this.request(`/sports/${sport}/odds-live`);
    }

    getMockOdds() {
        const bookmakers = ['Bet365', 'Pinnacle', 'Unibet', 'Betway', 'William Hill'];

        return Array(5).fill(null).map((_, i) => ({
            id: `match_${i}`,
            sport_key: 'soccer_epl',
            commence_time: new Date().toISOString(),
            home_team: `Home Team ${i}`,
            away_team: `Away Team ${i}`,
            bookmakers: bookmakers.map(name => ({
                key: name.toLowerCase().replace(' ', '_'),
                title: name,
                markets: [{
                    key: 'h2h',
                    outcomes: [
                        { name: `Home Team ${i}`, price: (1.5 + Math.random()).toFixed(2) },
                        { name: 'Draw', price: (3 + Math.random()).toFixed(2) },
                        { name: `Away Team ${i}`, price: (2.5 + Math.random() * 2).toFixed(2) }
                    ]
                }]
            }))
        }));
    }
}

/**
 * News API Service
 * Sports news and headlines
 */
export class NewsApiService {
    constructor() {
        this.baseUrl = API_CONFIG.newsApi.baseUrl;
        this.apiKey = API_CONFIG.newsApi.key;
        this.isDemo = this.apiKey === 'demo_key';
    }

    async getSportsNews(query = 'football', pageSize = 10) {
        if (this.isDemo) {
            return this.getMockNews(query);
        }

        try {
            const url = `${this.baseUrl}/everything?q=${encodeURIComponent(query)}&pageSize=${pageSize}&language=es&apiKey=${this.apiKey}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`News API Error: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('News API error:', error);
            return this.getMockNews(query);
        }
    }

    getMockNews(query) {
        const headlines = [
            `Última hora: ${query} - Jugador estrella se recupera`,
            `${query}: Análisis táctico del próximo partido`,
            `Mercado de fichajes: Novedades sobre ${query}`,
            `Lesiones: Lista actualizada del equipo`,
            `Declaraciones del técnico antes del partido`
        ];

        return {
            status: 'ok',
            articles: headlines.map((title, i) => ({
                title,
                description: `Noticia relacionada con ${query}...`,
                source: { name: ['ESPN', 'MARCA', 'AS', 'Sport'][i % 4] },
                publishedAt: new Date().toISOString(),
                url: '#'
            }))
        };
    }
}

/**
 * Weather API Service
 * Weather conditions for match venues
 */
export class WeatherApiService {
    constructor() {
        this.baseUrl = API_CONFIG.openWeather.baseUrl;
        this.apiKey = API_CONFIG.openWeather.key;
        this.isDemo = this.apiKey === 'demo_key';
    }

    async getWeather(city) {
        if (this.isDemo) {
            return this.getMockWeather(city);
        }

        try {
            const url = `${this.baseUrl}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${this.apiKey}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Weather API Error: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Weather API error:', error);
            return this.getMockWeather(city);
        }
    }

    getMockWeather(city) {
        const conditions = ['Clear', 'Clouds', 'Rain', 'Drizzle'];
        const condition = conditions[Math.floor(Math.random() * conditions.length)];

        return {
            name: city,
            weather: [{ main: condition, description: condition.toLowerCase() }],
            main: {
                temp: 15 + Math.floor(Math.random() * 15),
                humidity: 40 + Math.floor(Math.random() * 40)
            },
            wind: {
                speed: 5 + Math.floor(Math.random() * 15)
            }
        };
    }
}

// Export singleton instances
export const apiFootball = new ApiFootballService();
export const oddsApi = new OddsApiService();
export const newsApi = new NewsApiService();
export const weatherApi = new WeatherApiService();

export default {
    apiFootball,
    oddsApi,
    newsApi,
    weatherApi
};
