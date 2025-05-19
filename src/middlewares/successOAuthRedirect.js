const { generateToken } = require("../utils")
const setAuthCookie = require("../utils/setAuthCookie")

const successOAuthRedirect = (req, res) => {
  req.session.userId = req.user._id
  const token = generateToken(req.user._id)
  setAuthCookie(res, token)
  res.redirect(process.env.SUCCESS_REDIRECT_URL)
}

module.exports = successOAuthRedirect
