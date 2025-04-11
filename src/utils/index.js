const generateRandomUsername = (name) => {
  return (
    "user-" +
    name.trim().toLowerCase().replace(/\s+/g, "-") +
    "-" +
    Date.now() +
    "-" +
    Math.floor(Math.random() * 1000)
  )
}

module.exports = { generateRandomUsername }
