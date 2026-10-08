import axios from 'axios';

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const DEFAULT_CITY = 'Beni Mellal';

// Log at startup which mode is active
const isApiConfigured =
  WEATHER_API_KEY &&
  WEATHER_API_KEY.trim() !== '' &&
  !WEATHER_API_KEY.startsWith('your-');

if (isApiConfigured) {
  console.log('🌤️  Weather: OpenWeatherMap API configured (live data)');
} else {
  console.log('🌤️  Weather: No API key — using fallback data (set WEATHER_API_KEY in .env)');
}

/**
 * Fetch current weather + 5-day forecast from OpenWeatherMap.
 * Falls back to static sample data if API key is missing or call fails.
 * @param {string} [city]
 * @returns {Promise<object>}
 */
const getWeather = async (city = DEFAULT_CITY) => {
  if (!isApiConfigured) {
    return buildFallback(city);
  }

  try {
    // Fetch current weather and 5-day forecast in parallel
    const [currentRes, forecastRes] = await Promise.all([
      axios.get(`${BASE_URL}/weather`, {
        params: { q: city, appid: WEATHER_API_KEY, units: 'metric' },
        timeout: 5000,
      }),
      axios.get(`${BASE_URL}/forecast`, {
        params: { q: city, appid: WEATHER_API_KEY, units: 'metric', cnt: 40 },
        timeout: 5000,
      }),
    ]);

    const d = currentRes.data;
    const forecast = buildForecast(forecastRes.data);

    return {
      location:     d.name,
      temperature:  Math.round(d.main.temp),
      feelsLike:    Math.round(d.main.feels_like),
      condition:    d.weather[0].description,
      conditionMain: d.weather[0].main,
      humidity:     d.main.humidity,
      windSpeed:    d.wind?.speed,
      soilMoisture: estimateSoilMoisture(d.main.humidity),
      icon:         d.weather[0].icon,
      forecast,
      source: 'openweathermap',
    };
  } catch (err) {
    const code = err.response?.status;
    if (code === 401) {
      console.error('❌ Weather API: Invalid API key — check WEATHER_API_KEY in .env');
    } else if (code === 404) {
      console.error(`❌ Weather API: City "${city}" not found`);
    } else {
      console.warn(`⚠️  Weather API error (${code || err.code}): ${err.message} — using fallback`);
    }
    return buildFallback(city);
  }
};

/**
 * Build a daily forecast array from the 3-hour forecast list.
 */
function buildForecast(data) {
  const days = {};
  for (const item of data.list) {
    const date = item.dt_txt.split(' ')[0]; // "YYYY-MM-DD"
    if (!days[date]) {
      days[date] = { date, tempMin: item.main.temp, tempMax: item.main.temp, icon: item.weather[0].icon };
    } else {
      days[date].tempMin = Math.min(days[date].tempMin, item.main.temp);
      days[date].tempMax = Math.max(days[date].tempMax, item.main.temp);
    }
  }
  return Object.values(days)
    .slice(0, 5)
    .map(d => ({
      date:    d.date,
      tempMin: Math.round(d.tempMin),
      tempMax: Math.round(d.tempMax),
      icon:    d.icon,
    }));
}

function estimateSoilMoisture(humidity) {
  return Math.round(humidity * 0.6 * 10) / 10;
}

function buildFallback(city) {
  return {
    location:     city,
    temperature:  24,
    feelsLike:    22,
    condition:    'Sunny',
    conditionMain: 'Clear',
    humidity:     55,
    windSpeed:    3.2,
    soilMoisture: 33,
    icon:         '01d',
    forecast: [
      { date: 'Wed', tempMin: 18, tempMax: 23, icon: '01d' },
      { date: 'Thu', tempMin: 17, tempMax: 25, icon: '02d' },
      { date: 'Fri', tempMin: 16, tempMax: 20, icon: '10d' },
      { date: 'Sat', tempMin: 15, tempMax: 20, icon: '10d' },
      { date: 'Sun', tempMin: 14, tempMax: 21, icon: '13d' },
    ],
    source: 'fallback',
    note: 'Set WEATHER_API_KEY in .env for live weather data',
  };
}

export { getWeather };
export default { getWeather };
