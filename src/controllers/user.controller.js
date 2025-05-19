const User = require("../models/user.model")

const getUserById = async (req, res, next) => {
  // Get the user ID from the request
  const { id } = req.params
  // Get the user from the database
  const user = await User.findById(id)

  // If the user is not found, return an error
  if (!user) {
    next({
      status: 404,
      message: `User with ID ${id} not found`
    })
  }

  // Return the user
  return res.json({
    firstname: user.firstname,
    lastname: user.lastname,
    username: user.username,
    email: user.email,
    oauthProvider: user.oauthProvider,
    oauthId: user.oauthId,
    signupDate: user.signupDate,
    subscription: user.subscription,
    notifications: user.notifications
  })
}

module.exports = { getUserById }
