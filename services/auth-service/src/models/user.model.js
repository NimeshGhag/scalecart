const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zip: String,
  country: String,
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },

  avatar: {
    type: String,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  provider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },

  role: {
    type: String,
    enum: ["user", "seller"],
    default: "user",
  },

  password: {
    type: String,
    required: function () {
      return this.provider === "local";
    },
    select: false,
  },

  providerId: {
    type: String,
    required: function () {
      return this.provider === "google";
    },
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  address: [addressSchema],
});

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
