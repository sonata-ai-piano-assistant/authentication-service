const GitHubStrategy = require("passport-github2").Strategy
const passport = require("passport")
const { createUser, findUserByEmailOrOAuth } = require("../../user.service")

module.exports = passport.use(
  process.env.GITHUB_STRATEGY_NAME,
  new GitHubStrategy(
    {
      issuer: process.env.GITHUB_ISSUER,
      authorizationURL: process.env.GITHUB_AUTHORIZATION_URL,
      tokenURL: process.env.GITHUB_TOKEN_URL,
      userInfoURL: process.env.GITHUB_USERINFO_URL,
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_REDIRECT_URI,
      scope: process.env.GITHUB_SCOPE
    },
    async function verifyCallback(accessToken, refreshToken, profile, done) {
      let userToReturn = null
      try {
        // Find user with matching GITHUB ID
        const existingUser = await findUserByEmailOrOAuth(
          profile.email,
          process.env.GITHUB_STRATEGY_NAME,
          profile.id
        )
        if (!existingUser) {
          // User doesn't exist yet, create a new user
          const newUserData = {
            username: profile.username,
            email: profile.email,
            oauthAccounts: [
              {
                provider: process.env.GITHUB_STRATEGY_NAME,
                oauthId: profile.id
              }
            ]
          }
          // Save the new user to the database
          const newUser = await createUser(newUserData)
          userToReturn = newUser
        } else {
          userToReturn = existingUser
        }

        // Return the user
        return done(null, userToReturn)
      } catch (error) {
        return done(error, null)
      }
    }
  )
)
