const express = require('express');
const router = express.Router();
const { authToken } = require('../middlewares/authToken');
const dashboardController = require('../controllers/dashboardController');

// Get dashboard statistics
router.get('/stats', authToken, dashboardController.getDashboardStats);

module.exports = router; 