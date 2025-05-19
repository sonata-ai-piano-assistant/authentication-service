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
    user: user.sanitize()
  })
}

module.exports = { getUserById }
