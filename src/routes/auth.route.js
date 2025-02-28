const express = require("express")
const router = express.Router()
const GoogleAuth = require("../services/oauth/google")

router.get("/login/google", GoogleAuth.authenticate("google"))

router.get(
  "/google/callback",
  GoogleAuth.authenticate("google", {
    successRedirect: process.env.SUCCESS_REDIRECT_URL,
    failureRedirect: process.env.FAILURE_REDIRECT_URL
  })
)

router.post("/logout", function (req, res) {
  req.logout()
  res.redirect("/")
})

module.exports = router
