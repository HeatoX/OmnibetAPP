/**
 * OMNIBET AI - WEATHER SERVICE (V30.55)
 * Integrates Open-Meteo for real-time environmental analysis.
 */

// Coordinates for major league hubs (Baseline calibration)
const LEAGUE_COORDS = {
    'Spanish LALIGA': { lat: 40.42, lon: -3.70 }, // Madrid
    'English Premier League': { lat: 51.51, lon: -0.13 }, // London
    'Italian Serie A': { lat: 41.90, lon: 12.50 }, // Rome
    'German Bundesliga': { lat: 52.52, lon: 13.41 }, // Berlin
    'French Ligue 1': { lat: 48.86, lon: 2.35 }, // Paris
    'NBA': { lat: 40.71, lon: -74.01 }, // New York/East
    'MLB': { lat: 34.05, lon: -118.24 }, // LA/West
    'NFL': { lat: 39.74, lon: -104.99 }, // Denver/Central
};

/**
 * Fetches current weather for a specific location
 */
export async function getMatchWeather(league, venue = null) {
    try {
        const coords = LEAGUE_COORDS[league] || { lat: 0, lon: 0 };
        if (coords.lat === 0) return null;

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m&timezone=auto`;

        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return null;

        const data = await res.json();
        const current = data.current;

        // Interpret Weather Code (WMO standards)
        // 0: Clear, 1-3: Partly Cloudy, 51-67: Rain, 71-77: Snow, 95-99: Thunderstorm
        const code = current.weather_code;
        const isRaining = code >= 51 && code <= 67;
        const isStorming = code >= 95;
        const isSnowing = code >= 71 && code <= 77;
        const windSpeed = current.wind_speed_10m;

        let status = 'Clear';
        let impact = 1.0; // Multiplier for technical advantage
        let description = 'Condiciones óptimas';

        if (isStorming) {
            status = 'Stormy';
            impact = 0.85; // Technical teams suffer more in mud/rain
            description = 'Tormenta: Factor de aleatoriedad alto';
        } else if (isRaining) {
            status = 'Rainy';
            impact = 0.92;
            description = 'Lluvia: Campo rápido, beneficia juego directo';
        } else if (windSpeed > 25) {
            status = 'Windy';
            impact = 0.95;
            description = 'Viento fuerte: Afecta precisión de pases largos';
        }

        return {
            temp: current.temperature_2m,
            status,
            impact,
            description,
            windSpeed
        };
    } catch (e) {
        console.warn("Weather sync failed:", e);
        return null;
    }
}
// Export alias for backward compatibility or different naming conventions
export { getMatchWeather as getWeatherForecast };
