const Recommendation = require('../models/Recommendation');
const Deal = require('../models/Deal');
const { Activity } = require('../models/Activity');

exports.getAllRecommendations = async (req, res) => {
  try {
    const recommendations = await Recommendation.find()
      .populate('lead_id')
      .populate('property_id');
    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ message: 'Error fetching recommendations' });
  }
};

exports.getRecommendationById = async (req, res) => {
  try {
    const recommendation = await Recommendation.findById(req.params.id)
      .populate('lead_id')
      .populate('property_id');
    
    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }
    
    res.json(recommendation);
  } catch (error) {
    console.error('Error fetching recommendation:', error);
    res.status(500).json({ message: 'Error fetching recommendation' });
  }
};

exports.createRecommendation = async (req, res) => {
  try {
    const recommendation = new Recommendation({
      ...req.body,
      status: 'pending'
    });
    
    await recommendation.save();
    await recommendation.populate(['lead_id', 'property_id']);
    
    res.status(201).json(recommendation);
  } catch (error) {
    console.error('Error creating recommendation:', error);
    res.status(500).json({ message: 'Error creating recommendation' });
  }
};

exports.updateRecommendationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'accepted', 'rejected', 'converted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const recommendation = await Recommendation.findById(id);
    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    const oldStatus = recommendation.status;
    recommendation.status = status;
    await recommendation.save();
    await recommendation.populate(['lead_id', 'property_id']);

    // If converting to deal, create the deal and activity
    if (status === 'converted') {
      const deal = new Deal({
        lead_id: recommendation.lead_id._id,
        property_id: recommendation.property_id._id,
        agent_id: req.tokenData.id,
        status: 'open',
        notes: 'Created from recommendation'
      });

      await deal.save();
      await deal.populate(['lead_id', 'property_id', 'agent_id']);

      // Create activity for recommendation conversion
      await Activity.create({
        type: 'recommendation_converted',
        agent_id: req.tokenData.id,
        lead_id: recommendation.lead_id._id,
        deal_id: deal._id,
        recommendation_id: recommendation._id
      });
    }

    res.json(recommendation);
  } catch (error) {
    console.error('Error updating recommendation status:', error);
    res.status(500).json({ message: 'Error updating recommendation status' });
  }
};

exports.deleteRecommendation = async (req, res) => {
  try {
    const recommendation = await Recommendation.findByIdAndDelete(req.params.id);
    
    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }
    
    res.json({ message: 'Recommendation deleted successfully' });
  } catch (error) {
    console.error('Error deleting recommendation:', error);
    res.status(500).json({ message: 'Error deleting recommendation' });
  }
}; 