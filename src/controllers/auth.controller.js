const User = require("../models/user.model")
const jwt = require("jsonwebtoken")
const { createUser } = require("../services/user.service")
const { generateToken } = require("../utils")
const setAuthCookie = require("../utils/setAuthCookie")

const registerUser = async (req, res, next) => {
  try {
    // Get the user data from the request
    const { firstname, lastname, username, email, password } = req.body
    // Check if the user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] })

    // If the user already exists, return an error
    if (existingUser) {
      return next({
        status: 409,
        message: "User already exists"
      })
    }
    // Create a new user
    const user = await createUser({
      firstname,
      lastname,
      username,
      email,
      password
    })
    // Save the user to the database
    await user.save()

    // Send a welcome email
    // await fetch(`${process.env.EMAIL_SERVICE_URL}/send-email`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${process.env.EMAIL_SERVICE_API_KEY}`
    //   },
    //   body: JSON.stringify({
    //     to: user.email,
    //     subject: "Welcome to Our Service",
    //     text: `Hello ${user.firstname},\n\nThank you for registering with us! We're excited to have you on board.\n\nBest regards,\nThe Team`
    //   })
    // })

    // Return the user
    return res.status(201).json({
      user: user.sanitize()
    })
  } catch (error) {
    // If there is an error, return an error
    return next({
      status: 500,
      message: error.message
    })
  }
}

const loginUser = async (req, res, next) => {
  try {
    // Get the user data from the request
    const { identifier, password } = req.body
    // Check if the user exists
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }]
    })
    // If the user does not exist, return an error
    if (!user) {
      return next({
        status: 401,
        message: "Invalid credentials"
      })
    }
    // Check if the password is correct
    const isPasswordValid = await user.comparePassword(password)
    // If the password is incorrect, return an error
    if (!isPasswordValid) {
      return next({
        status: 401,
        message: "Invalid credentials"
      })
    }
    // Set the user ID in the session
    req.session.userId = user._id
    // Return the user token
    const token = generateToken(user._id)
    setAuthCookie(res, token)

    return res.status(200).json({
      message: `${user.username} logged in successfully`
    })
  } catch (error) {
    return next({
      status: 500,
      message: error.message
    })
  }
}

const isAuthenticated = async (req, res, next) => {
  try {
    // Get the user token from the request
    const token = req.headers.authorization.split(" ")[1]
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // Find the user by ID
    const user = await User.findById(decoded.id)
    // If the user does not exist, return an error
    if (!user) {
      return next({
        status: 401,
        message: "Invalid token"
      })
    }
    // Attach the user to the request object
    return res.status(200).json({
      user: user.sanitize()
    })
  } catch (error) {
    return next({
      status: 401,
      message: "Invalid token"
    })
  }
}

module.exports = { registerUser, loginUser, isAuthenticated }
