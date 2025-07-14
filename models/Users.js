const mongoose = require("mongoose");
const Joi = require("joi");

const userSchema = new mongoose.Schema({
  full_name: String,
  email: String,
  password: String,
  phone: String,
  profile_img: String,
  agency: {
    type: String,
    required: false
  },
  role: {
    type: String,
    default: "agent"
  },
  is_active: {
    type: Boolean,
    default: true
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }],
  date_created: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

exports.User = mongoose.model("User", userSchema);

exports.validUser = (_bodyData) => {
  const joiSchema = Joi.object({
    full_name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(20).required(),
    phone: Joi.string().min(9).max(12).required(),
    profile_img: Joi.string().allow(""),
    agency: Joi.string().allow("", null),
    role: Joi.string().valid("admin", "agent", "client").required(),
    is_active: Joi.boolean(),
    favorites: Joi.array().items(Joi.string())
  });

  return joiSchema.validate(_bodyData);
};

exports.validUserUpdate = (_bodyData) => {
  const joiSchema = Joi.object({
    full_name: Joi.string().min(2).max(50),
    email: Joi.string().email(),
    phone: Joi.string().min(9).max(12),
    profile_img: Joi.string().allow(""),
    agency: Joi.string().allow("", null),
    role: Joi.string().valid("admin", "agent", "client"),
    is_active: Joi.boolean(),
    favorites: Joi.array().items(Joi.string())
  });

  return joiSchema.validate(_bodyData);
};

exports.validForgotPassword = (_bodyData) => {
  const joiSchema = Joi.object({
    email: Joi.string().email().required()
  });

  return joiSchema.validate(_bodyData);
};

exports.validResetPassword = (_bodyData) => {
  const joiSchema = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).max(20).required()
  });

  return joiSchema.validate(_bodyData);
};
