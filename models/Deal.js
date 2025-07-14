const mongoose = require("mongoose");
const Joi = require("joi");

const dealSchema = new mongoose.Schema({
  lead_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lead",
    required: true
  },
  property_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true
  },
  agent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    enum: ["open", "negotiation", "closed", "canceled"],
    default: "open"
  },
  final_price: {
    type: Number
  },
  notes: {
    type: String,
    default: ""
  },
  date_opened: {
    type: Date,
    default: Date.now
  },
  date_closed: {
    type: Date
  }
});

exports.Deal = mongoose.model("Deal", dealSchema);

exports.validDeal = (_bodyData) => {
  const joiSchema = Joi.object({
    lead_id: Joi.string().hex().length(24).required(),
    property_id: Joi.string().hex().length(24).required(),
    agent_id: Joi.string().hex().length(24).required(),
    status: Joi.string().valid("open", "negotiation", "closed", "canceled"),
    final_price: Joi.number().min(0),
    notes: Joi.string().allow(""),
    date_closed: Joi.date().optional(),
    date_opened: Joi.date().optional()
  });

  return joiSchema.validate(_bodyData);
};

exports.validDealUpdate = (_bodyData) => {
  const joiSchema = Joi.object({
    status: Joi.string().valid("open", "negotiation", "closed", "canceled").optional(),
    final_price: Joi.number().min(0).optional(),
    notes: Joi.string().allow("").optional()
  });

  return joiSchema.validate(_bodyData);
};
