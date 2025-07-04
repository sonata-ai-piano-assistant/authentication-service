const { generateToken } = require("../utils")

const successOAuthRedirect = (req, res) => {
  req.session.userId = req.user._id
  const token = generateToken(req.user._id)
  const redirectUrl = `${process.env.SUCCESS_REDIRECT_URL}?token=${token}`
  res.redirect(redirectUrl)
}

module.exports = successOAuthRedirect
