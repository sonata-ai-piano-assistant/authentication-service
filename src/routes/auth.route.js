const express = require("express")
const router = express.Router()
const GoogleAuth = require("../services/oauth/google")
const MicrosoftAuth = require("../services/oauth/microsoft")
const GithubAuth = require("../services/oauth/github")
const authController = require("../controllers/auth.controller")
const successOAuthRedirect = require("../middlewares/successOAuthRedirect")

router.get("/login/google", GoogleAuth.authenticate("google"))

router.get(
  "/google/callback",
  GoogleAuth.authenticate("google", {
    failureRedirect: process.env.FAILURE_REDIRECT_URL
  }),
  successOAuthRedirect
)

router.get("/login/microsoft", MicrosoftAuth.authenticate("microsoft"))
router.get(
  "/microsoft/callback",
  MicrosoftAuth.authenticate("microsoft", {
    failureRedirect: process.env.FAILURE_REDIRECT_URL
  }),
  successOAuthRedirect
)

router.get("/login/github", GithubAuth.authenticate("github"))

router.get(
  "/github/callback",
  GithubAuth.authenticate("github", {
    failureRedirect: process.env.FAILURE_REDIRECT_URL
  }),
  successOAuthRedirect
)

router.post("/login", authController.loginUser)
router.post("/register", authController.registerUser)
router.post("/validate-token", authController.isAuthenticated)

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) return next(err)
    // Destroy the session
    req.session.destroy(() => {
      // Clear the session cookie
      res.clearCookie("connect.sid")
      // Clear your auth token cookie (if set as a cookie)
      res.clearCookie("auth_token")
      // Optionally, redirect or send a response
      res.status(200).json({ message: "Logged out successfully" })
    })
  })
})

module.exports = router
