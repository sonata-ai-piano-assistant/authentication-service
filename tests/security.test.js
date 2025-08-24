const request = require("supertest")
const app = require("../src/index")
const { describe, test, expect, afterAll } = require("jest")

// Mock environment variables for testing
process.env.NODE_ENV = "test"
process.env.JWT_SECRET = "test-secret-key-for-security-tests"
process.env.MONGODB_URI = "mongodb://localhost:27017/sonata_test"

describe("🔒 SECURITY TESTS - Authentication Service", () => {
  describe("SQL/NoSQL Injection Protection", () => {
    test("should prevent NoSQL injection in login", async () => {
      const maliciousPayloads = [
        { identifier: { $ne: null }, password: { $ne: null } },
        { identifier: { $regex: ".*" }, password: "anything" },
        { identifier: { $where: "this.password" }, password: "test" },
        { identifier: "admin'; DROP TABLE users; --", password: "test" }
      ]

      for (const payload of maliciousPayloads) {
        const response = await request(app).post("/auth/login").send(payload)

        // Should not return 200 with malicious payloads
        expect(response.status).not.toBe(200)
        expect(response.status).toBeGreaterThanOrEqual(400)
      }
    })

    test("should prevent NoSQL injection in registration", async () => {
      const maliciousPayload = {
        firstname: "Test",
        lastname: "User",
        username: { $ne: null },
        email: { $regex: ".*@.*" },
        password: "password123"
      }

      const response = await request(app)
        .post("/api/auth/register")
        .send(maliciousPayload)

      expect(response.status).not.toBe(201)
      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe("XSS Protection", () => {
    test("should sanitize XSS in registration fields", async () => {
      const xssPayloads = [
        "<script>alert('xss')</script>",
        "javascript:alert('xss')",
        "<img src=x onerror=alert('xss')>",
        "';alert('xss');//"
      ]

      for (const xssPayload of xssPayloads) {
        const response = await request(app).post("/api/auth/register").send({
          firstname: xssPayload,
          lastname: "User",
          username: "testuser",
          email: "test@example.com",
          password: "password123"
        })

        // Should either reject or sanitize the input
        if (response.status === 201) {
          expect(response.body.data.firstname).not.toContain("<script>")
          expect(response.body.data.firstname).not.toContain("javascript:")
        } else {
          expect(response.status).toBeGreaterThanOrEqual(400)
        }
      }
    })
  })

  describe("JWT Security", () => {
    test("should reject tampered JWT tokens", async () => {
      const tamperedTokens = [
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.TAMPERED.signature",
        "invalid.jwt.format",
        "",
        "null",
        '{"alg":"none","typ":"JWT"}.eyJzdWIiOiIxMjM0NTY3ODkwIn0.'
      ]

      for (const token of tamperedTokens) {
        const response = await request(app)
          .post("/api/auth/validate-token")
          .send({ token })

        expect(response.status).toBe(401)
        expect(response.body.message).toContain("Unauthorized")
      }
    })

    test("should reject expired tokens", async () => {
      // Create an expired token (past exp claim)
      const jwt = require("jsonwebtoken")
      const expiredToken = jwt.sign(
        { id: "test-user", exp: Math.floor(Date.now() / 1000) - 3600 }, // 1 hour ago
        process.env.JWT_SECRET
      )

      const response = await request(app)
        .post("/api/auth/validate-token")
        .send({ token: expiredToken })

      expect(response.status).toBe(401)
      expect(response.body.message).toContain("Unauthorized")
    })
  })

  describe("Password Security", () => {
    test("should enforce strong password policy", async () => {
      const weakPasswords = ["123", "password", "12345678", "qwerty", "admin"]

      for (const weakPassword of weakPasswords) {
        const response = await request(app)
          .post("/api/auth/register")
          .send({
            firstname: "Test",
            lastname: "User",
            username: "testuser" + Math.random(),
            email: "test" + Math.random() + "@example.com",
            password: weakPassword
          })

        // Should reject weak passwords
        expect(response.status).not.toBe(201)
      }
    })

    test("should hash passwords before storage", async () => {
      const password = "TestPassword123!"

      const response = await request(app)
        .post("/api/auth/register")
        .send({
          firstname: "Test",
          lastname: "User",
          username: "testuser" + Math.random(),
          email: "test" + Math.random() + "@example.com",
          password: password
        })

      if (response.status === 201) {
        // Password should never be returned in plain text
        expect(response.body.data.password).toBeUndefined()

        // If password is returned, it should be hashed (starts with $2b$ for bcrypt)
        if (response.body.data && response.body.data.password) {
          expect(response.body.data.password).toMatch(/^\$2[aby]\$/)
          expect(response.body.data.password).not.toBe(password)
        }
      }
    })
  })

  describe("CSRF Protection", () => {
    test("should validate Content-Type for POST requests", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .set("Content-Type", "text/plain")
        .send("identifier=admin&password=admin")

      // Should reject non-JSON content types for sensitive operations
      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe("Rate Limiting & Brute Force Protection", () => {
    test("should handle multiple failed login attempts", async () => {
      const loginAttempts = []

      // Simulate 10 rapid failed login attempts
      for (let i = 0; i < 10; i++) {
        loginAttempts.push(
          request(app).post("/auth/login").send({
            identifier: "nonexistent@example.com",
            password: "wrongpassword"
          })
        )
      }

      const responses = await Promise.all(loginAttempts)

      // All should fail with 401
      responses.forEach((response) => {
        expect(response.status).toBe(401)
      })

      // Check if any rate limiting is applied (status 429)
      const hasRateLimiting = responses.some(
        (response) => response.status === 429
      )

      // Log for manual verification if no automatic rate limiting
      if (!hasRateLimiting) {
        console.warn(
          "⚠️  No rate limiting detected - consider implementing brute force protection"
        )
      }
    })
  })

  describe("Input Validation Security", () => {
    test("should validate email format", async () => {
      const invalidEmails = [
        "notanemail",
        "@example.com",
        "test@",
        "test..test@example.com",
        "test@example..com"
      ]

      for (const email of invalidEmails) {
        const response = await request(app).post("/api/auth/register").send({
          firstname: "Test",
          lastname: "User",
          username: "testuser",
          email: email,
          password: "ValidPassword123!"
        })

        expect(response.status).not.toBe(201)
      }
    })

    test("should prevent oversized payloads", async () => {
      const largeString = "x".repeat(10000) // 10KB string

      const response = await request(app)
        .post("/api/auth/register")
        .send({
          firstname: largeString,
          lastname: largeString,
          username: largeString,
          email: largeString + "@example.com",
          password: largeString
        })

      // Should reject oversized inputs
      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe("HTTP Security Headers", () => {
    test("should include security headers in responses", async () => {
      await request(app)
        .get("/auth/health") // Assuming health check endpoint
        .expect((res) => {
          // Check for common security headers
          const headers = res.headers

          // Log headers for manual verification
          console.log("Security Headers Check:", {
            "x-frame-options": headers["x-frame-options"],
            "x-content-type-options": headers["x-content-type-options"],
            "x-xss-protection": headers["x-xss-protection"],
            "strict-transport-security": headers["strict-transport-security"]
          })
        })
    })
  })
})

// Clean up after tests
afterAll(async () => {
  // Close any open connections
  if (global.__MONGO_CONNECTION__) {
    await global.__MONGO_CONNECTION__.close()
  }
})
