const jwt = require("jsonwebtoken")
const userService = require("../services/user.service")
const { generateToken } = require("../utils")

const registerUser = async (req, res, next) => {
  try {
    // Get the user data from the request
    const { firstname, lastname, username, email, password } = req.body
    // Check if the user already exists
    const existingUser =
      (await userService.getUserByIdentifier(email)) ||
      (await userService.getUserByIdentifier(username))
    // If the user already exists, return an error
    if (existingUser) {
      return next({
        status: 409,
        message: "User already exists"
      })
    }
    // Create a new user
    const user = await userService.createUser({
      firstname,
      lastname,
      username,
      email,
      password
    })

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
      data: user
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
    const user = await userService.verifyUserCredentials(identifier, password)
    // If the user does not exist, return an error
    if (!user) {
      return next({
        status: 401,
        message: "Invalid credentials"
      })
    }
    console.log({ user })

    // Set the user ID in the session
    req.session.userId = user.id
    // Return the user token
    const token = generateToken(user.id)

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

const isAuthenticated = async (req, res, next) => {
  try {
    // Get the user token from the request
    const { token } = req.body
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // Find the user by ID
    const user = await userService.getUserById(decoded.id)
    // Attach the user to the request object
    return res.status(200).json({
      user
    })
  } catch (error) {
    return next({
      status: 401,
      message: `Unauthorized: ${error.message}`
    })
  }
}

module.exports = { registerUser, loginUser, isAuthenticated }
