const mongoose = require("mongoose");
const Joi = require("joi");

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 2
  },
  description: {
    type: String,
    default: ""
  },
  type: {
    type: String,
    enum: ["apartment", "house", "commercial", "land", "other"],
    default: "apartment"
  },
  address: {
    street: String,
    city: String,
    country: String
  },
  price: {
    type: Number,
    required: true
  },
  features: {
    rooms: Number,
    bathrooms: Number,
    size_sqm: Number,
    floor: Number,
    parking: Boolean,
    balcony: Boolean
  },
  images: [String],
  listed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  is_active: {
    type: Boolean,
    default: true
  },
  date_created: {
    type: Date,
    default: Date.now
  }
});

exports.Property = mongoose.model("Property", propertySchema);

// ✅ ולידציה להוספה
exports.validProperty = (_bodyData) => {
  const joiSchema = Joi.object({
    title: Joi.string().min(2).required(),
    description: Joi.string().allow(""),
    type: Joi.string().valid("apartment", "house", "commercial", "land", "other"),
    address: Joi.object({
      street: Joi.string().allow(""),
      city: Joi.string().allow(""),
      country: Joi.string().allow("")
    }),
    price: Joi.number().min(0).required(),
    features: Joi.object({
      rooms: Joi.number().min(0),
      bathrooms: Joi.number().min(0),
      size_sqm: Joi.number().min(0),
      floor: Joi.number().min(0),
      parking: Joi.boolean(),
      balcony: Joi.boolean()
    }),
    images: Joi.array().items(Joi.string()),
    listed_by: Joi.string().hex().length(24),
    is_active: Joi.boolean()
  });

  return joiSchema.validate(_bodyData);
};

// ✅ ולידציה לעדכון
exports.validPropertyUpdate = (_bodyData) => {
  const joiSchema = Joi.object({
    title: Joi.string().min(2).required().messages({
      'string.min': 'כותרת חייבת להכיל לפחות 2 תווים',
      'any.required': 'כותרת היא שדה חובה'
    }),
    description: Joi.string().allow("").default(""),
    type: Joi.string().valid("apartment", "house", "commercial", "land", "other").required().messages({
      'any.only': 'סוג נכס לא תקין',
      'any.required': 'סוג נכס הוא שדה חובה'
    }),
    address: Joi.object({
      street: Joi.string().allow("").default(""),
      city: Joi.string().allow("").default(""),
      country: Joi.string().allow("").default("")
    }).default({}),
    price: Joi.number().min(0).required().messages({
      'number.min': 'מחיר חייב להיות מספר חיובי',
      'any.required': 'מחיר הוא שדה חובה'
    }),
    features: Joi.object({
      rooms: Joi.number().min(0).default(0),
      bathrooms: Joi.number().min(0).default(0),
      size_sqm: Joi.number().min(0).default(0),
      floor: Joi.number().min(0).default(0),
      parking: Joi.boolean().default(false),
      balcony: Joi.boolean().default(false)
    }).default({}),
    images: Joi.array().items(Joi.string()).default([]),
    listed_by: Joi.string().hex().length(24).required().messages({
      'string.hex': 'מזהה משתמש לא תקין',
      'string.length': 'מזהה משתמש לא תקין',
      'any.required': 'מזהה משתמש הוא שדה חובה'
    }),
    is_active: Joi.boolean().default(true)
  });

  return joiSchema.validate(_bodyData);
};
