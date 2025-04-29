const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  firstname: { type: String },
  lastname: { type: String },
  username: { type: String, required: true },
  email: { type: String, unique: true },
  password: { type: String },
  oauthAccounts: [
    {
      provider: {
        type: String,
        enum: [
          process.env.GOOGLE_STRATEGY_NAME,
          process.env.MICROSOFT_STRATEGY_NAME,
          process.env.GITHUB_STRATEGY_NAME
        ],
        required: true
      },
      oauthId: { type: String, required: true },
      linkedAt: { type: Date, default: Date.now }
    }
  ],
  signupDate: { type: Date, default: Date.now },
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true }
  }
})

module.exports = mongoose.model("User", userSchema)
