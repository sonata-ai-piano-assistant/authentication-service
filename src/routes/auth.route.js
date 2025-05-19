const express = require("express")
const router = express.Router()
const GoogleAuth = require("../services/oauth/google")
const MicrosoftAuth = require("../services/oauth/microsoft")
const GithubAuth = require("../services/oauth/github")
const authController = require("../controllers/auth.controller")

router.get("/login/google", GoogleAuth.authenticate("google"))

router.get(
  "/google/callback",
  GoogleAuth.authenticate("google", {
    successRedirect: process.env.SUCCESS_REDIRECT_URL,
    failureRedirect: process.env.FAILURE_REDIRECT_URL
  })
)

router.get("/login/microsoft", MicrosoftAuth.authenticate("microsoft"))
router.get(
  "/microsoft/callback",
  MicrosoftAuth.authenticate("microsoft", {
    successRedirect: process.env.SUCCESS_REDIRECT_URL,
    failureRedirect: process.env.FAILURE_REDIRECT_URL
  })
)

router.get("/login/github", GithubAuth.authenticate("github"))

router.get(
  "/github/callback",
  GithubAuth.authenticate("github", {
    successRedirect: process.env.SUCCESS_REDIRECT_URL,
    failureRedirect: process.env.FAILURE_REDIRECT_URL
  })
)

router.post("/login", authController.loginUser)
router.post("/register", authController.registerUser)

router.post("/logout", function (req, res) {
  req.logout()
  res.redirect("/")
})

module.exports = router
