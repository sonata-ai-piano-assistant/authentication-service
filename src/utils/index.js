const generateRandomUsername = (email) => {
  const baseName = email.split("@")[0].toLowerCase().replace(/\s+/g, "-")
  return (
    "user-" +
    baseName.trim().toLowerCase().replace(/\s+/g, "-") +
    "-" +
    Date.now() +
    "-" +
    Math.floor(Math.random() * 1000)
  )
}

module.exports = { generateRandomUsername }
