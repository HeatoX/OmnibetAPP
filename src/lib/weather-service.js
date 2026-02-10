/**
 * OMNIBET AI - WEATHER SERVICE (V30.55)
 * Integrates Open-Meteo for real-time environmental analysis.
 */

// Coordinates for major league hubs (Baseline calibration)
// Coordinates for major league hubs and specific cities (V42 Expansion)
const LOCATION_COORDS = {
    // Leagues (Defaults)
    'Spanish LALIGA': { lat: 40.41, lon: -3.70 }, // Madrid
    'English Premier League': { lat: 51.50, lon: -0.12 }, // London
    'Italian Serie A': { lat: 41.90, lon: 12.49 }, // Rome
    'German Bundesliga': { lat: 52.52, lon: 13.40 }, // Berlin
    'French Ligue 1': { lat: 48.85, lon: 2.35 }, // Paris
    'NBA': { lat: 40.71, lon: -74.00 }, // NYC
    'MLB': { lat: 34.05, lon: -118.24 }, // LA
    'NFL': { lat: 39.73, lon: -104.99 }, // Denver

    // Major Cities (Used if venue name contains them)
    'liverpool': { lat: 53.40, lon: -2.99 },
    'manchester': { lat: 53.48, lon: -2.24 },
    'barcelona': { lat: 41.38, lon: 2.17 },
    'munich': { lat: 48.13, lon: 11.58 },
    'milan': { lat: 45.46, lon: 9.18 },
    'turin': { lat: 45.07, lon: 7.68 },
    'naples': { lat: 40.85, lon: 14.26 },
    'sevilla': { lat: 37.38, lon: -5.98 },
    'dortmund': { lat: 51.51, lon: 7.46 },
    'buenos aires': { lat: -34.60, lon: -58.38 },
    'sao paulo': { lat: -23.55, lon: -46.63 },
    'rio de janeiro': { lat: -22.90, lon: -43.17 },
    'mexico city': { lat: 19.43, lon: -99.13 },
};

/**
 * Fetches current weather for a specific location
 */
export async function getMatchWeather(league, venue = null) {
    try {
        let coords = LOCATION_COORDS[league] || { lat: 0, lon: 0 };

        // 1. Specific City Detection (V42)
        if (venue) {
            const vLower = venue.toLowerCase();

            // Check if venue is indoor
            const isIndoor = vLower.includes('dome') || vLower.includes('roof') || vLower.includes('indoor') || vLower.includes('aren');
            if (isIndoor) {
                return { temp: 21, status: 'Indoor', impact: 1.0, description: 'Clima controlado (Estadio techado)', windSpeed: 0 };
            }

            for (const city in LOCATION_COORDS) {
                if (vLower.includes(city)) {
                    coords = LOCATION_COORDS[city];
                    break;
                }
            }
        }

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
