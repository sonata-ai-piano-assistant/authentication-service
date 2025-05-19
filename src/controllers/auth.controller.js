const User = require("../models/user.model")
const { createUser } = require("../services/user.service")

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
    // Return the user token
    const token = user.generateToken()
    return res.status(200).json({
      token
    })
  } catch (error) {
    return next({
      status: 500,
      message: error.message
    })
  }
}

module.exports = { registerUser, loginUser }
