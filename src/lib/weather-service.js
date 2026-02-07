/**
 * Weather Service Agent 🌤️
 * Fetches real-time weather for match locations
 * Source: OpenMeteo (Free, No Key required)
 */

// Stadium Coordinates Database (Top Venues)
const STADIUM_COORDS = {
    // Premier League
    'Anfield': { lat: 53.4308, lon: -2.9608 },
    'Old Trafford': { lat: 53.4631, lon: -2.2913 },
    'Emirates Stadium': { lat: 51.5549, lon: -0.1084 },
    'Stamford Bridge': { lat: 51.4816, lon: -0.1910 },
    'Etihad Stadium': { lat: 53.4831, lon: -2.2004 },

    // La Liga
    'Santiago Bernabéu': { lat: 40.4530, lon: -3.6883 },
    'Camp Nou': { lat: 41.3809, lon: 2.1228 },
    'Civitas Metropolitano': { lat: 40.4361, lon: -3.5995 },

    // US Sports (NFL/NBA Cities approx)
    'Lambeau Field': { lat: 44.5013, lon: -88.0622 },
    'Arrowhead Stadium': { lat: 39.0489, lon: -94.4839 },
    'MetLife Stadium': { lat: 40.8128, lon: -74.0742 },
};

// Generic City Coordinates (Fallback)
const CITY_COORDS = {
    'London': { lat: 51.5074, lon: -0.1278 },
    'Manchester': { lat: 53.4808, lon: -2.2426 },
    'Liverpool': { lat: 53.4084, lon: -2.9916 },
    'Madrid': { lat: 40.4168, lon: -3.7038 },
    'Barcelona': { lat: 41.3851, lon: 2.1734 },
    'Paris': { lat: 48.8566, lon: 2.3522 },
    'Berlin': { lat: 52.5200, lon: 13.4050 },
    'Rome': { lat: 41.9028, lon: 12.4964 },
    'New York': { lat: 40.7128, lon: -74.0060 },
    'Los Angeles': { lat: 34.0522, lon: -118.2437 },
};

/**
 * Get coordinates for a match
 */
function getCoordinates(venueName, homeTeamName) {
    // 1. Try exact stadium match
    if (STADIUM_COORDS[venueName]) return STADIUM_COORDS[venueName];

    // 2. Try city match in home team name (e.g. "Manchester City" -> "Manchester")
    for (const [city, coords] of Object.entries(CITY_COORDS)) {
        if (homeTeamName?.includes(city) || venueName?.includes(city)) {
            return coords;
        }
    }

    return null; // No weather data available
}

/**
 * Fetch weather forecast
 */
export async function getWeatherForecast(venueName, homeTeamName, matchDate) {
    const coords = getCoordinates(venueName, homeTeamName);
    if (!coords) return null;

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,precipitation_sum,windspeed_10m_max&current_weather=true&timezone=auto`;

        const response = await fetch(url);
        if (!response.ok) return null;

        const data = await response.json();

        // Simple logic: Use current weather if match is today, otherwise use daily forecast
        const current = data.current_weather;

        // Determine impact
        let impact = { score: 0, description: 'Conditions Normal' };

        if (current.windspeed > 25) {
            impact = { score: -10, description: 'High Winds - Hard for passing/kicking' };
        } else if (data.daily?.precipitation_sum?.[0] > 5) {
            impact = { score: -5, description: 'Heavy Rain - Slippery pitch' };
        } else if (current.temperature < 0) {
            impact = { score: -5, description: 'Freezing - Ball is harder' };
        } else if (current.temperature > 30) {
            impact = { score: -5, description: 'Extreme Heat - High fatigue' };
        }

        return {
            temp: current.temperature,
            wind: current.windspeed,
            condition: getWeatherCodeString(current.weathercode),
            impact
        };

    } catch (e) {
        console.warn('Weather fetch failed', e);
        return null;
    }
}

function getWeatherCodeString(code) {
    if (code === 0) return '☀️ Clear';
    if (code <= 3) return 'cloudy ⛅ Partly Cloudy';
    if (code <= 48) return 'fog 🌫️ Foggy';
    if (code <= 67) return 'rain 🌧️ Rainy';
    if (code <= 77) return 'snow ❄️ Snowy';
    if (code >= 95) return 'storm ⛈️ Thunderstorm';
    return 'Unknown';
}
