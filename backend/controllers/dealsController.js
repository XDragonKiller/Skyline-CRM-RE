const Deal = require('../models/Deal');

exports.getAllDeals = async (req, res) => {
  try {
    const deals = await Deal.find()
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
      ...req.body
    });
    
    await deal.save();
    await deal.populate(['lead_id', 'property_id', 'agent_id']);
    
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

    const deal = await Deal.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate(['lead_id', 'property_id', 'agent_id']);

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

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

    // Validate status if provided
    if (status) {
      const validStatuses = ['open', 'negotiation', 'closed', 'canceled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
    }

    // Build update object with only provided fields
    const updateData = {};
    if (status) updateData.status = status;
    if (final_price) updateData.final_price = final_price;
    if (notes) updateData.notes = notes;

    const deal = await Deal.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate(['lead_id', 'property_id', 'agent_id']);

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    res.json(deal);
  } catch (error) {
    console.error('Error updating deal:', error);
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