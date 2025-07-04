/**
 *
 * @param {Object} user
 * @param {string} user.username - The username of the user
 * @param {string} user.email - The email of the user
 * @param {string} user.password - The password of the user
 * @param {string} user.firstname - The first name of the user
 * @param {string} user.lastname - The last name of the user
 * @param {Array} user.oauthAccounts - The OAuth accounts associated with the user (optional
 * default: [])
 * @param {string} user.oauthAccounts.provider - The OAuth provider (e.g., '
 * google', 'github')
 * @param {string} user.oauthAccounts.oauthId - The OAuth ID for the provider
 * @returns The created user object if successful, otherwise throws an error
 * @description Creates a new user by sending a request to the database service.
 */
const createUser = async (user) => {
  try {
    const response = await fetch(`${process.env.DATABASE_SERVICE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(user)
    })
    if (!response.ok) {
      throw new Error("Failed to create user")
    }
    const json = await response.json()
    return json.data
  } catch (error) {
    throw new Error(error)
  }
}
/**
 *
 * @param {string} email
 * @param {string} provider
 * @param {string} oauthId
 * @returns The user object if found, otherwise throws an error
 * @description Finds a user by email or OAuth ID by sending a request to the database service
 */
const findUserByEmailOrOAuth = async (email, provider, oauthId) => {
  try {
    const response = await fetch(
      `${process.env.DATABASE_SERVICE_URL}/users/find/oauth`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, provider, oauthId })
      }
    )

    if (!response.ok) {
      throw new Error("Failed to find user by email or OAuth")
    }

    const json = await response.json()
    return json.data
  } catch (error) {
    throw new Error(error)
  }
}

/**
 *
 * @param {string} identifier
 * @returns The user object if found, otherwise returns null
 * @description Retrieves a user by their identifier (username or email) by sending a request to the database service.
 */
const getUserByIdentifier = async (identifier) => {
  try {
    const response = await fetch(
      `${process.env.DATABASE_SERVICE_URL}/users/find`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ identifier })
      }
    )

    if (!response.ok) {
      throw new Error("Failed to find user by identifier")
    }

    const json = await response.json()
    return json.data
  } catch (error) {
    console.log(`Error fetching user by identifier: ${error.message}`)
    return null
  }
}
/**
 *
 * @param {string} identifier
 * @param {string} password
 * @returns The user object if credentials are valid, otherwise throws an error
 * @description Verifies user credentials by sending a request to the database service.
 */
const verifyUserCredentials = async (identifier, password) => {
  try {
    const response = await fetch(
      `${process.env.DATABASE_SERVICE_URL}/users/verify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ identifier, password })
      }
    )

    if (!response.ok) {
      throw new Error("Failed to verify user credentials")
    }

    const json = await response.json()
    return json.data
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * @param {string} userId - The ID of the user to retrieve
 * @returns {Promise<Object>} The user object if found, otherwise throws an error
 * @description Retrieves a user by their ID by sending a request to the database service.
 */
const getUserById = async (userId) => {
  try {
    const response = await fetch(
      `${process.env.DATABASE_SERVICE_URL}/users/${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      }
    )
    if (!response.ok) {
      throw new Error("Failed to get user by ID")
    }
    const json = await response.json()
    return json.data
  } catch (error) {
    throw new Error(error)
  }
}

module.exports = {
  createUser,
  findUserByEmailOrOAuth,
  getUserByIdentifier,
  verifyUserCredentials,
  getUserById
}
