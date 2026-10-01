const { getWeather } = require('../services/weather.service');

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

module.exports = { getWeatherData };
