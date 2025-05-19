const setAuthCookie = (res, token) => {
  // Set the authentication cookie
  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  })
}
module.exports = setAuthCookie
