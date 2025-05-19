const bcrypt = require("bcrypt")
const User = require("../models/user.model")

const createUser = async (user) => {
  try {
    // hash the user's password
    if (user.password) {
      user.password = await bcrypt.hash(user.password, Number(process.env.HASH))
    }
    // Create a new user
    const newUser = new User(user)
    // Save the user to the database
    await newUser.save()
    // Return the new user
    return newUser
  } catch (error) {
    throw new Error(error)
  }
}

module.exports = { createUser }
