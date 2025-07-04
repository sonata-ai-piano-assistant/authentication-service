/* eslint-disable no-unused-vars */
function errorHandlingMiddleware(err, req, res, next) {
  console.error(err)

  const status = err.status || 500
  const message = err.message || "Internal Server Error"

  return res.status(status).json({
    status,
    message
  })
}

module.exports = errorHandlingMiddleware
