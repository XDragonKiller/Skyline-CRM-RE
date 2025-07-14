const express = require('express');
const router = express.Router();
const dealsController = require('../controllers/dealsController');
const authToken = require('../middleware/authToken');
const { validDealUpdate } = require('../models/Deal');

// Get all deals
router.get('/', authToken, dealsController.getAllDeals);

// Get deal by ID
router.get('/:id', authToken, dealsController.getDealById);

// Create new deal
router.post('/', authToken, dealsController.createDeal);

// Update deal status
router.put('/:id/status', authToken, dealsController.updateDealStatus);

// Update deal
router.put('/:id', authToken, validDealUpdate, dealsController.updateDeal);

// Delete deal
router.delete('/:id', authToken, dealsController.deleteDeal);

module.exports = router; 