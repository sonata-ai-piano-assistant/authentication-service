const express = require("express")
const router = express.Router()
const passport = require("passport")
const session = require("express-session")
const authRouter = require("./auth.route")
const errorHandlingMiddleware = require("../middlewares/errorHandling")

// Initialize passport
router.use(passport.initialize())

// Use the session middleware
router.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: parseInt(process.env.SESSION_MAX_AGE, 10) } // Set to true if using HTTPS
  })
)

// Initialize passport session after session middleware
router.use(passport.session())

// Serialize user into the sessions
passport.serializeUser(function (user, done) {
  try {
    done(null, user)
  } catch (err) {
    done(err)
  }
})

// Deserialize user from the sessions
passport.deserializeUser(function (obj, done) {
  try {
    done(null, obj)
  } catch (err) {
    done(err)
  }
})

router.use("/auth", authRouter)
router.use(errorHandlingMiddleware)

module.exports = router
