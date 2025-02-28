const generateRandomUsername = () => {
  return "user-" + Math.floor(Math.random() * 1000)
}

module.exports = { generateRandomUsername }
