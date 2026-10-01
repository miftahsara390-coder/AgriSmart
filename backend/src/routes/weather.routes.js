const express = require('express');
const router = express.Router();
const { getWeatherData } = require('../controllers/weather.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, getWeatherData);

module.exports = router;
