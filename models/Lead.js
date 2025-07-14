const mongoose = require("mongoose");
const Joi = require("joi");

const leadSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
  },
  phone: {
    type: String,
    required: true,
    minlength: 9,
    maxlength: 12,
  },
  email: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    default: "manual",
  },
  agent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: ["new", "in_progress", "converted", "lost"],
    default: "new",
  },
  notes: {
    type: String,
    default: "",
  },
  date_created: {
    type: Date,
    default: Date.now,
  },
  preferences: {
    property_type: {
      type: String,
      enum: ["apartment", "house", "commercial", "land", "other"],
      required: true
    },
    price_range: {
      min: { type: Number, required: true },
      max: { type: Number, required: true }
    },
    location: {
      city: { type: String, required: true },
      region: { type: String, required: true }
    },
    features: {
      rooms: { type: Number, required: true },
      bathrooms: { type: Number, required: true },
      size_sqm: { type: Number, required: true },
      parking: { type: Boolean, default: false },
      balcony: { type: Boolean, default: false }
    },
    family_size: { type: Number, required: true },
    urgency: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    }
  }
});

exports.Lead = mongoose.model("Lead", leadSchema);

exports.validLead = (_bodyData) => {
  const joiSchema = Joi.object({
    full_name: Joi.string().min(2).max(100).required(),
    phone: Joi.string().min(9).max(12).required(),
    email: Joi.string().email().required(),
    source: Joi.string().default("manual"),
    status: Joi.string().valid("new", "in_progress", "converted", "lost").default("new"),
    notes: Joi.string().allow("", null),
    preferences: Joi.object({
      property_type: Joi.string().valid("apartment", "house", "commercial", "land", "other").required(),
      price_range: Joi.object({
        min: Joi.number().required(),
        max: Joi.number().required()
      }).required(),
      location: Joi.object({
        city: Joi.string().required(),
        region: Joi.string().required()
      }).required(),
      features: Joi.object({
        rooms: Joi.number().required(),
        bathrooms: Joi.number().required(),
        size_sqm: Joi.number().required(),
        parking: Joi.boolean().default(false),
        balcony: Joi.boolean().default(false)
      }).required(),
      family_size: Joi.number().required(),
      urgency: Joi.string().valid("low", "medium", "high").default("medium")
    }).required()
  });

  return joiSchema.validate(_bodyData);
};

exports.validLeadUpdate = (_bodyData) => {
  const joiSchema = Joi.object({
    full_name: Joi.string().min(2).max(100),
    phone: Joi.string().min(9).max(12),
    email: Joi.string().email(),
    source: Joi.string(),
    status: Joi.string().valid("new", "in_progress", "converted", "lost"),
    notes: Joi.string().allow("", null),
    preferences: Joi.object({
      property_type: Joi.string().valid("apartment", "house", "commercial", "land", "other"),
      price_range: Joi.object({
        min: Joi.number(),
        max: Joi.number()
      }),
      location: Joi.object({
        city: Joi.string(),
        region: Joi.string()
      }),
      features: Joi.object({
        rooms: Joi.number(),
        bathrooms: Joi.number(),
        size_sqm: Joi.number(),
        parking: Joi.boolean(),
        balcony: Joi.boolean()
      }),
      family_size: Joi.number(),
      urgency: Joi.string().valid("low", "medium", "high")
    })
  });

  return joiSchema.validate(_bodyData);
};
