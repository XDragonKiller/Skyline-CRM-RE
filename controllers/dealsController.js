const { Deal } = require('../models/Deal');
const { Activity } = require('../models/Activity');
const { User } = require('../models/Users');
const { Notification } = require('../models/Notification');

exports.getAllDeals = async (req, res) => {
  try {
    let query = {};

    // If user is an admin, get all deals from their agency
    if (req.tokenData.role === "admin") {
      // First get all agents from the same agency
      const agents = await User.find({ agency: req.tokenData.agency }, "_id");
      const agentIds = agents.map(agent => agent._id);
      query = { agent_id: { $in: agentIds } };
    } else {
      // Regular agents only see their own deals
      query = { agent_id: req.tokenData.id };
    }

    const deals = await Deal.find(query)
      .populate('lead_id')
      .populate('property_id')
      .populate('agent_id');
    res.json(deals);
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ message: 'Error fetching deals' });
  }
};

exports.getDealById = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('lead_id')
      .populate('property_id')
      .populate('agent_id');
    
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    
    res.json(deal);
  } catch (error) {
    console.error('Error fetching deal:', error);
    res.status(500).json({ message: 'Error fetching deal' });
  }
};

exports.createDeal = async (req, res) => {
  try {
    const deal = new Deal({
      ...req.body,
      agent_id: req.tokenData.id
    });
    
    await deal.save();
    await deal.populate(['lead_id', 'property_id', 'agent_id']);

    // Create activity for new deal
    await Activity.create({
      type: 'deal_created',
      agent_id: req.tokenData.id,
      lead_id: deal.lead_id._id,
      deal_id: deal._id,
      agency: req.tokenData.agency
    });

    // Create notification for new deal
    await Notification.create({
      user_id: req.tokenData.id,
      message: `New deal created for lead "${deal.lead_id.full_name}"`,
      type: 'deal',
      reference_id: deal._id,
      is_read: false
    });
    
    res.status(201).json(deal);
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(500).json({ message: 'Error creating deal' });
  }
};

exports.updateDealStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['open', 'negotiation', 'closed', 'canceled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const deal = await Deal.findById(id);
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    const oldStatus = deal.status;
    deal.status = status;
    await deal.save();
    await deal.populate(['lead_id', 'property_id', 'agent_id']);

    // Create activity for status change
    await Activity.create({
      type: 'deal_status_change',
      agent_id: req.tokenData.id,
      lead_id: deal.lead_id._id,
      deal_id: deal._id,
      old_value: oldStatus,
      new_value: status,
      agency: req.tokenData.agency
    });

    // Create notification for status change
    await Notification.create({
      user_id: req.tokenData.id,
      message: `Deal status updated to "${status}" for lead "${deal.lead_id.full_name}"`,
      type: 'deal',
      reference_id: deal._id,
      is_read: false
    });

    res.json(deal);
  } catch (error) {
    console.error('Error updating deal status:', error);
    res.status(500).json({ message: 'Error updating deal status' });
  }
};

exports.updateDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, final_price, notes } = req.body;

    // First find the deal to check ownership
    const deal = await Deal.findById(id);
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    // Check if user has permission to update this deal
    if (req.tokenData.role !== "admin" && deal.agent_id.toString() !== req.tokenData.id) {
      return res.status(403).json({ message: 'Not authorized to update this deal' });
    }

    // Build update object with only provided fields
    const updateData = {};
    if (status !== undefined) {
      updateData.status = status;
      // Create activity for status change
      await Activity.create({
        type: 'deal_status_change',
        agent_id: req.tokenData.id,
        lead_id: deal.lead_id._id,
        deal_id: deal._id,
        old_value: deal.status,
        new_value: status,
        agency: req.tokenData.agency
      });
    }
    if (final_price !== undefined) updateData.final_price = final_price;
    if (notes !== undefined) updateData.notes = notes;

    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const updatedDeal = await Deal.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate(['lead_id', 'property_id', 'agent_id']);

    if (!updatedDeal) {
      return res.status(404).json({ message: 'Deal not found after update' });
    }

    res.json(updatedDeal);
  } catch (error) {
    console.error('Error updating deal:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ message: 'Error updating deal' });
  }
};

exports.deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);
    
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    
    res.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    console.error('Error deleting deal:', error);
    res.status(500).json({ message: 'Error deleting deal' });
  }
}; 