const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  oauthProvider: {
    type: String,
    enum: [
      process.env.GOOGLE_STRATEGY_NAME,
      process.env.MICROSOFT_STRATEGY_NAME,
      process.env.APPLE_STRATEGY_NAME
    ]
  },
  oauthId: { type: String },
  signupDate: { type: Date, default: Date.now },
  subscription: {
    type: {
      type: String,
      enum: ["free", "premium", "pro"],
      default: "free"
    },
    startDate: { type: Date },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ["active", "inactive", "canceled"],
      default: "inactive"
    }
  },
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true }
  }
})

module.exports = mongoose.model("User", userSchema)
