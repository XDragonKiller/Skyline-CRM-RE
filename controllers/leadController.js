const { Lead } = require("../models/Lead");
const { Activity } = require("../models/Activity");
const { User } = require("../models/Users");
const { Notification } = require("../models/Notification");

// Get all leads
const getAllLeads = async (req, res) => {
  try {
    let query = {};

    // If user is an admin, get all leads from their agency
    if (req.tokenData.role === "admin") {
      // First get all agents from the same agency
      const agents = await User.find({ agency: req.tokenData.agency }, "_id");
      const agentIds = agents.map(agent => agent._id);
      query = { agent_id: { $in: agentIds } };
    } else {
      // Regular agents only see their own leads
      query = { agent_id: req.tokenData.id };
    }

    const leads = await Lead.find(query).populate("agent_id", "full_name email");
    res.json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get lead by ID
const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate("agent_id", "full_name");
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.json(lead);
  } catch (error) {
    console.error("Error fetching lead:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new lead
const createLead = async (req, res) => {
  try {
    // Add agent_id from token
    const leadData = {
      ...req.body,
      agent_id: req.tokenData.id
    };

    const lead = await Lead.create(leadData);

    console.log('Creating activity for new lead:', {
      type: 'lead_status_change',
      agent_id: req.tokenData.id,
      lead_id: lead._id,
      agency: req.tokenData.agency,
      old_value: 'none',
      new_value: 'new'
    });

    // Create activity for lead creation
    try {
      const activity = await Activity.create({
        type: 'lead_status_change',
        agent_id: req.tokenData.id,
        lead_id: lead._id,
        agency: req.tokenData.agency,
        old_value: 'none',
        new_value: 'new'
      });
      console.log('Activity created successfully:', activity);
    } catch (activityError) {
      console.error('Error creating activity:', activityError);
      // Don't fail the whole request if activity creation fails
    }

    // Create notification for lead creation
    await Notification.create({
      user_id: req.tokenData.id,
      message: `New lead "${lead.full_name}" created`,
      type: 'lead',
      reference_id: lead._id,
      is_read: false
    });

    res.status(201).json(lead);
  } catch (error) {
    console.error("Error creating lead:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// Update lead status
const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['new', 'in_progress', 'converted', 'lost'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const oldStatus = lead.status;
    lead.status = status;
    await lead.save();

    try {
      // Create activity for status change
      await Activity.create({
        type: 'lead_status_change',
        agent_id: req.tokenData.id,
        lead_id: lead._id,
        old_value: oldStatus,
        new_value: status,
        agency: req.tokenData.agency
      });

      // Create notification for status change
      await Notification.create({
        user_id: req.tokenData.id,
        message: `Lead "${lead.full_name}" status updated to "${status}"`,
        type: 'lead',
        reference_id: lead._id,
        is_read: false
      });
    } catch (activityError) {
      console.error("Error creating activity/notification:", activityError);
      // Don't fail the whole request if activity/notification creation fails
    }

    res.json(lead);
  } catch (error) {
    console.error("Error updating lead status:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ 
      message: "Server error",
      error: error.message 
    });
  }
};

// Assign lead to agent
const assignLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { agent_id } = req.body;
    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const oldAgentId = lead.agent_id;
    lead.agent_id = agent_id;
    await lead.save();

    // Create activity for lead assignment
    await Activity.create({
      type: 'lead_assigned',
      agent_id: req.tokenData.id,
      lead_id: lead._id,
      old_value: oldAgentId ? oldAgentId.toString() : null,
      new_value: agent_id,
      agency: req.tokenData.agency
    });

    // Create notification for lead assignment
    await Notification.create({
      user_id: agent_id, // Notify the assigned agent
      message: `Lead "${lead.full_name}" assigned to you`,
      type: 'lead',
      reference_id: lead._id,
      is_read: false
    });

    res.json(lead);
  } catch (error) {
    console.error("Error assigning lead:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Unassign lead
const unassignLead = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const oldAgentId = lead.agent_id;
    lead.agent_id = null;
    await lead.save();

    // Create activity for lead unassignment
    await Activity.create({
      type: 'lead_unassigned',
      agent_id: req.tokenData.id,
      lead_id: lead._id,
      old_value: oldAgentId ? oldAgentId.toString() : null,
      new_value: null
    });

    res.json(lead);
  } catch (error) {
    console.error("Error unassigning lead:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update lead
const updateLead = async (req, res) => {
  try {
    const updated = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.json(updated);
  } catch (error) {
    console.error("Error updating lead:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete lead
const deleteLead = async (req, res) => {
  try {
    const deleted = await Lead.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.json({ message: "Lead deleted successfully" });
  } catch (error) {
    console.error("Error deleting lead:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { 
  getAllLeads,
  getLeadById,
  createLead,
  updateLeadStatus,
  assignLead,
  unassignLead,
  updateLead,
  deleteLead
};
