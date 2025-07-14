const express = require('express');
const router = express.Router();
const { User } = require('../models/Users');
const { Property } = require('../models/Property');
const { authToken } = require('../middlewares/authToken');

// Get user's favorites
router.get('/', authToken, async (req, res) => {
  try {
    const user = await User.findById(req.tokenData.id).populate('favorites');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Check if property is in favorites
router.get('/:propertyId', authToken, async (req, res) => {
  try {
    const user = await User.findById(req.tokenData.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isFavorite = user.favorites.includes(req.params.propertyId);
    res.json({ isFavorite });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add to favorites
router.post('/', authToken, async (req, res) => {
  try {
    const { propertyId } = req.body;
    
    // Verify property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const user = await User.findById(req.tokenData.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already in favorites
    if (user.favorites.includes(propertyId)) {
      return res.status(400).json({ message: 'Property already in favorites' });
    }

    user.favorites.push(propertyId);
    await user.save();

    res.json({ message: 'Added to favorites' });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove from favorites
router.delete('/:propertyId', authToken, async (req, res) => {
  try {
    const user = await User.findById(req.tokenData.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const propertyIndex = user.favorites.indexOf(req.params.propertyId);
    if (propertyIndex === -1) {
      return res.status(400).json({ message: 'Property not in favorites' });
    }

    user.favorites.splice(propertyIndex, 1);
    await user.save();

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 