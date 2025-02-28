const express = require("express")
const mongoose = require("mongoose")
require("dotenv").config()

const app = express()
const port = process.env.PORT
const apiRouter = require("./routes")

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Connect to the database
mongoose
  .connect(process.env.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 45000
  })
  .then(() => {
    console.log("Connected to the database")
  })
  .catch((error) => {
    console.log("Error connecting to the database: ", error)
  })

app.get("/", (_, res) => {
  res.send("Welcome to the API")
})
app.use("/api", apiRouter)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
