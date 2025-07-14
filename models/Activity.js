const mongoose = require("mongoose");
const Joi = require("joi");

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      "lead_status_change",
      "deal_status_change",
      "deal_created",
      "recommendation_converted",
      "lead_assigned",
      "lead_unassigned"
    ],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  agent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  lead_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lead",
    required: true
  },
  deal_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Deal"
  },
  agency: {
    type: String,
    required: true
  },
  old_value: {
    type: String
  },
  new_value: {
    type: String
  }
});

exports.Activity = mongoose.model("Activity", activitySchema);

exports.validActivity = (_bodyData) => {
  const joiSchema = Joi.object({
    type: Joi.string().valid(
      "lead_status_change",
      "deal_status_change",
      "deal_created",
      "recommendation_converted",
      "lead_assigned",
      "lead_unassigned"
    ).required(),
    date: Joi.date(),
    agent_id: Joi.string().hex().length(24).required(),
    lead_id: Joi.string().hex().length(24).required(),
    deal_id: Joi.string().hex().length(24),
    agency: Joi.string().required(),
    old_value: Joi.string(),
    new_value: Joi.string()
  });

  return joiSchema.validate(_bodyData);
};

exports.validActivityUpdate = (_bodyData) => {
  const joiSchema = Joi.object({
    type: Joi.string().valid(
      "lead_status_change",
      "deal_status_change",
      "deal_created",
      "recommendation_converted",
      "lead_assigned",
      "lead_unassigned"
    ),
    date: Joi.date(),
    agent_id: Joi.string().hex().length(24),
    lead_id: Joi.string().hex().length(24),
    deal_id: Joi.string().hex().length(24),
    agency: Joi.string(),
    old_value: Joi.string(),
    new_value: Joi.string()
  });

  return joiSchema.validate(_bodyData);
};
