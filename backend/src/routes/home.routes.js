const express = require('express');
const router = express.Router();
const { getHomeDashboard } = require('../controllers/home.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, getHomeDashboard);

module.exports = router;
