const mongoose = require("mongoose");
const Joi = require("joi");

const notificationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["lead", "property", "deal"],
    required: true
  },
  reference_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  is_read: {
    type: Boolean,
    default: false
  },
  date_created: {
    type: Date,
    default: Date.now
  }
});

exports.Notification = mongoose.model("Notification", notificationSchema);

exports.validNotification = (_bodyData) => {
  const joiSchema = Joi.object({
    user_id: Joi.string().hex().length(24).required(),
    message: Joi.string().min(3).max(300).required(),
    type: Joi.string().valid("lead", "property", "deal").required(),
    reference_id: Joi.string().hex().length(24).required(),
    is_read: Joi.boolean()
  });

  return joiSchema.validate(_bodyData);
};

exports.validNotificationUpdate = (_bodyData) => {
  const joiSchema = Joi.object({
    message: Joi.string().min(3).max(300),
    type: Joi.string().valid("lead", "property", "deal"),
    reference_id: Joi.string().hex().length(24),
    is_read: Joi.boolean()
  });

  return joiSchema.validate(_bodyData);
};
