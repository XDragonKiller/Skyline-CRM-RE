const express = require("express");
const router = express.Router();
const leadController = require("../controllers/leadController");
const { authToken } = require("../middlewares/authToken");
const { validLeadUpdate } = require("../models/Lead");

// Get all leads
router.get("/", authToken, leadController.getAllLeads);

// Get lead by ID
router.get("/:id", authToken, leadController.getLeadById);

// Create new lead
router.post("/", authToken, leadController.createLead);

// Update lead status
router.put("/:id/status", authToken, leadController.updateLeadStatus);

// Assign lead to agent
router.put("/:id/assign", authToken, leadController.assignLead);

// Unassign lead
router.put("/:id/unassign", authToken, leadController.unassignLead);

// Update lead
router.put("/:id", authToken, (req, res, next) => {
  const { error } = validLeadUpdate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
}, leadController.updateLead);

// Delete lead
router.delete("/:id", authToken, leadController.deleteLead);

module.exports = router;
