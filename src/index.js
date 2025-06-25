const express = require("express")
require("dotenv").config()

const app = express()
const port = process.env.PORT
const apiRouter = require("./routes")

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/", (_, res) => {
  res.send("Welcome to the API")
})
app.use("/api", apiRouter)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
