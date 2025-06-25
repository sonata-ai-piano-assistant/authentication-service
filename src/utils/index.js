const generateToken = (userID) => {
  const jwt = require("jsonwebtoken")
  return jwt.sign(
    {
      id: userID
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION }
  )
}

const generateRandomUsername = async (email) => {
  const baseName = email.split("@")[0].toLowerCase().replace(/\s+/g, "-")
  const randomUsername =
    "user-" +
    baseName.trim().toLowerCase().replace(/\s+/g, "-") +
    "-" +
    Date.now() +
    "-" +
    Math.floor(Math.random() * 1000) +
    Math.random().toString(36).substring(2, 10)
  return randomUsername
}

module.exports = { generateRandomUsername, generateToken }
