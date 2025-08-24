const request = require("supertest")
const jwt = require("jsonwebtoken")
const jest = require("jest")
const { describe, test, expect, beforeEach, afterAll } = require("jest")
// Mock the dependencies
jest.mock("../src/services/user.service")
jest.mock("../src/services/notification.service")

const userService = require("../src/services/user.service")
const notificationService = require("../src/services/notification.service")

// Set up test environment
process.env.NODE_ENV = "test"
process.env.JWT_SECRET = "test-secret-key"

const app = require("../src/index")

describe("🧪 UNIT TESTS - Auth Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("POST /auth/register", () => {
    test("should successfully register new user", async () => {
      const mockUser = {
        id: "user123",
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        email: "john@example.com"
      }

      userService.getUserByIdentifier
        .mockResolvedValueOnce(null) // First call (email)
        .mockResolvedValueOnce(null) // Second call (username)
      userService.createUser.mockResolvedValue(mockUser)
      notificationService.sendRegistrationEmail.mockResolvedValue(true)

      const response = await request(app).post("/api/auth/register").send({
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        email: "john@example.com",
        password: "Password123!"
      })

      expect(response.status).toBe(201)
      expect(response.body.data).toEqual(mockUser)
      expect(userService.createUser).toHaveBeenCalledWith({
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        email: "john@example.com",
        password: "Password123!"
      })
    })

    test("should reject registration if user already exists", async () => {
      const existingUser = { id: "existing123", email: "john@example.com" }

      userService.getUserByIdentifier.mockResolvedValue(existingUser)

      const response = await request(app).post("/api/auth/register").send({
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        email: "john@example.com",
        password: "Password123!"
      })

      expect(response.status).toBe(409)
      expect(response.body.message).toBe("User already exists")
      expect(userService.createUser).not.toHaveBeenCalled()
    })

    test("should handle registration errors gracefully", async () => {
      userService.getUserByIdentifier.mockResolvedValue(null)
      userService.createUser.mockRejectedValue(new Error("Database error"))

      const response = await request(app).post("/api/auth/register").send({
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        email: "john@example.com",
        password: "Password123!"
      })

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Database error")
    })

    test("should continue if notification service fails", async () => {
      const mockUser = {
        id: "user123",
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        email: "john@example.com"
      }

      userService.getUserByIdentifier.mockResolvedValue(null)
      userService.createUser.mockResolvedValue(mockUser)
      notificationService.sendRegistrationEmail.mockRejectedValue(
        new Error("Email service down")
      )

      const consoleSpy = jest.spyOn(console, "error").mockImplementation()

      const response = await request(app).post("/api/auth/register").send({
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        email: "john@example.com",
        password: "Password123!"
      })

      expect(response.status).toBe(201)
      expect(response.body.data).toEqual(mockUser)
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe("POST /auth/login", () => {
    test("should successfully login valid user", async () => {
      const mockUser = {
        id: "user123",
        username: "johndoe",
        email: "john@example.com"
      }

      userService.verifyUserCredentials.mockResolvedValue(mockUser)

      const response = await request(app).post("/api/auth/login").send({
        identifier: "john@example.com",
        password: "Password123!"
      })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty("token")

      // Verify token is valid
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET)
      expect(decoded.id).toBe(mockUser.id)
    })

    test("should reject invalid credentials", async () => {
      userService.verifyUserCredentials.mockResolvedValue(null)

      const response = await request(app).post("/api/auth/login").send({
        identifier: "wrong@example.com",
        password: "wrongpassword"
      })

      expect(response.status).toBe(401)
      expect(response.body.message).toBe("Invalid credentials")
      expect(response.body).not.toHaveProperty("token")
    })

    test("should handle login service errors", async () => {
      userService.verifyUserCredentials.mockRejectedValue(
        new Error("Service unavailable")
      )

      const response = await request(app).post("/api/auth/login").send({
        identifier: "john@example.com",
        password: "Password123!"
      })

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Service unavailable")
    })
  })

  describe("POST /auth/verify", () => {
    test("should verify valid JWT token", async () => {
      const mockUser = {
        id: "user123",
        username: "johndoe",
        email: "john@example.com"
      }

      const validToken = jwt.sign({ id: mockUser.id }, process.env.JWT_SECRET)
      userService.getUserById.mockResolvedValue(mockUser)

      const response = await request(app)
        .post("/api/auth/validate-token")
        .send({ token: validToken })

      expect(response.status).toBe(200)
      expect(response.body.user).toEqual(mockUser)
      expect(userService.getUserById).toHaveBeenCalledWith(mockUser.id)
    })

    test("should reject invalid JWT token", async () => {
      const response = await request(app)
        .post("/api/auth/validate-token")
        .send({ token: "invalid-token" })

      expect(response.status).toBe(401)
      expect(response.body.message).toContain("Unauthorized")
    })

    test("should reject token for non-existent user", async () => {
      const validToken = jwt.sign({ id: "nonexistent" }, process.env.JWT_SECRET)
      userService.getUserById.mockResolvedValue(null)

      const response = await request(app)
        .post("/api/auth/validate-token")
        .send({ token: validToken })

      expect(response.status).toBe(200)
      expect(response.body.user).toBeNull()
    })

    test("should handle verification service errors", async () => {
      const validToken = jwt.sign({ id: "user123" }, process.env.JWT_SECRET)
      userService.getUserById.mockRejectedValue(
        new Error("Database connection failed")
      )

      const response = await request(app)
        .post("/api/auth/validate-token")
        .send({ token: validToken })

      expect(response.status).toBe(401)
      expect(response.body.message).toContain("Unauthorized")
    })
  })

  describe("Input Validation", () => {
    test("should reject registration with missing fields", async () => {
      const incompleteData = [
        {
          lastname: "Doe",
          username: "johndoe",
          email: "john@example.com",
          password: "Password123!"
        },
        {
          firstname: "John",
          username: "johndoe",
          email: "john@example.com",
          password: "Password123!"
        },
        {
          firstname: "John",
          lastname: "Doe",
          email: "john@example.com",
          password: "Password123!"
        },
        {
          firstname: "John",
          lastname: "Doe",
          username: "johndoe",
          password: "Password123!"
        },
        {
          firstname: "John",
          lastname: "Doe",
          username: "johndoe",
          email: "john@example.com"
        }
      ]

      for (const data of incompleteData) {
        const response = await request(app)
          .post("/api/auth/register")
          .send(data)

        expect(response.status).toBeGreaterThanOrEqual(400)
      }
    })

    test("should reject login with missing fields", async () => {
      const incompleteData = [
        { password: "Password123!" },
        { identifier: "john@example.com" },
        {}
      ]

      for (const data of incompleteData) {
        const response = await request(app).post("/api/auth/login").send(data)

        expect(response.status).toBeGreaterThanOrEqual(400)
      }
    })
  })

  describe("Security Features", () => {
    test("should not expose sensitive user data", async () => {
      const mockUser = {
        id: "user123",
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        email: "john@example.com",
        password: "hashed-password" // Should not be returned
      }

      userService.getUserByIdentifier.mockResolvedValue(null)
      userService.createUser.mockResolvedValue(mockUser)
      notificationService.sendRegistrationEmail.mockResolvedValue(true)

      const response = await request(app).post("/api/auth/register").send({
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        email: "john@example.com",
        password: "Password123!"
      })

      expect(response.status).toBe(201)
      expect(response.body.data.password).toBeUndefined()
    })

    test("should generate unique tokens for different users", async () => {
      const user1 = { id: "user1", email: "user1@example.com" }
      const user2 = { id: "user2", email: "user2@example.com" }

      userService.verifyUserCredentials.mockResolvedValueOnce(user1)

      const response1 = await request(app)
        .post("/api/auth/login")
        .send({ identifier: "user1@example.com", password: "password" })

      userService.verifyUserCredentials.mockResolvedValueOnce(user2)

      const response2 = await request(app)
        .post("/api/auth/login")
        .send({ identifier: "user2@example.com", password: "password" })

      expect(response1.body.token).not.toBe(response2.body.token)
    })
  })
})

// Clean up
afterAll(() => {
  jest.clearAllMocks()
})
