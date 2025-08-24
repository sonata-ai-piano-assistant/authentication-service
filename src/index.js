const express = require("express")
const cors = require("cors")
const {
  initializeMetrics,
  metricsRouter,
  metricsMiddleware
} = require("../src/utils/metrics")

require("dotenv").config()

const app = express()
const port = process.env.PORT
const apiRouter = require("./routes")
const loggerMiddleware = require("./middlewares/logger.middleware")

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// 🔧 INITIALISATION DES MÉTRIQUES
initializeMetrics("authentification")

// 📊 MIDDLEWARE MÉTRIQUES
app.use(metricsMiddleware)
app.use(loggerMiddleware)
// 🛣️ ROUTES MÉTRIQUES
app.use(metricsRouter)

app.get("/", (_, res) => {
  res.send("Welcome to the API")
})
app.use("/api", apiRouter)

// Only start server if not in test environment
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  })
}

module.exports = app
