const mongoose = require("mongoose");
const Joi = require("joi");

const recommendationSchema = new mongoose.Schema({
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
  match_score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  match_details: {
    price_match: { type: Number, required: true },
    location_match: { type: Number, required: true },
    features_match: { type: Number, required: true },
    type_match: { type: Number, required: true }
  },
  status: {
    type: String,
    enum: ["pending", "viewed", "contacted", "rejected", "converted"],
    default: "pending"
  },
  date_created: {
    type: Date,
    default: Date.now
  },
  last_updated: {
    type: Date,
    default: Date.now
  }
});

exports.Recommendation = mongoose.model("Recommendation", recommendationSchema);

exports.validRecommendation = (_bodyData) => {
  const joiSchema = Joi.object({
    lead_id: Joi.string().hex().length(24).required(),
    property_id: Joi.string().hex().length(24).required(),
    match_score: Joi.number().min(0).max(100).required(),
    match_details: Joi.object({
      price_match: Joi.number().required(),
      location_match: Joi.number().required(),
      features_match: Joi.number().required(),
      type_match: Joi.number().required()
    }).required(),
    status: Joi.string().valid("pending", "viewed", "contacted", "rejected", "converted")
  });

  return joiSchema.validate(_bodyData);
};

exports.validRecommendationUpdate = (_bodyData) => {
  const joiSchema = Joi.object({
    property_id: Joi.string().hex().length(24),
    lead_id: Joi.string().hex().length(24),
    agent_id: Joi.string().hex().length(24),
    note: Joi.string().allow("")
  });

  return joiSchema.validate(_bodyData);
};
