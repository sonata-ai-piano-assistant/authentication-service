const OpenIDConnectStrategy = require("passport-openidconnect")
const passport = require("passport")
const { createUser, findUserByEmailOrOAuth } = require("../../user.service")

const fetch = require("node-fetch")
const { generateRandomUsername } = require("../../../utils")

const getUserDataFromMicrosoftGraph = async (accessToken) => {
  try {
    const response = await fetch("https://graph.microsoft.com/v1.0/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.statusText}`)
    }

    const userData = await response.json()
    return userData
  } catch (error) {
    console.error("Error fetching user data from Microsoft Graph:", error)
    throw error
  }
}

module.exports = passport.use(
  process.env.MICROSOFT_STRATEGY_NAME,
  new OpenIDConnectStrategy(
    {
      issuer: process.env.MICROSOFT_ISSUER,
      authorizationURL: process.env.MICROSOFT_AUTHORIZATION_URL,
      tokenURL: process.env.MICROSOFT_TOKEN_URL,
      userInfoURL: process.env.MICROSOFT_USERINFO_URL,
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: process.env.MICROSOFT_REDIRECT_URI,
      scope: process.env.MICROSOFT_SCOPE
    },
    async function verifyCallback(
      issuer,
      profile,
      context,
      idToken,
      accessToken,
      refreshToken,
      cb
    ) {
      let userToReturn = null
      try {
        // Find user with matching Microsoft ID
        const existingUser = await findUserByEmailOrOAuth(
          profile.emails[0].value,
          process.env.MICROSOFT_STRATEGY_NAME,
          profile.id)
        // User doesn't exist yet, create a new user
        if (!existingUser) {
          const userData = await getUserDataFromMicrosoftGraph(accessToken)

          const newUserData = {
            firstname: userData.givenName,
            lastname: userData.surname,
            username: await generateRandomUsername(profile.emails[0].value),
            email: profile.emails[0].value,
            oauthAccounts: [
              {
                provider: process.env.MICROSOFT_STRATEGY_NAME,
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
        return cb(null, userToReturn)
      } catch (error) {
        return cb(error, null)
      }
    }
  )
)
