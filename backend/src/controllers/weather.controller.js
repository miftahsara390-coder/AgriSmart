import { getWeather } from '../services/weather.service.js';

// GET /api/weather?city=BeniMellal
const getWeatherData = async (req, res, next) => {
  try {
    const city = req.query.city || 'Beni Mellal';
    const weather = await getWeather(city);
    res.json({ weather });
  } catch (error) {
    next(error);
  }
};

export { getWeatherData };
export default { getWeatherData };
