// Test setup and global mocks
const jest = require("jest")
const { beforeAll, afterAll } = require("jest")

// Mock environment variables
process.env.NODE_ENV = "test"
process.env.JWT_SECRET = "test-secret-key-for-jest-tests"
process.env.MONGODB_URI = "mongodb://localhost:27017/sonata_test"
process.env.SESSION_SECRET = "test-session-secret"

// Mock external services that require network calls
jest.mock("../src/services/notification.service", () => ({
  sendRegistrationEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true)
}))

// Suppress console.error in tests unless needed
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (args[0]?.includes && args[0].includes("Warning")) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
