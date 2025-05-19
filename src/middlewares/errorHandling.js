function errorHandlingMiddleware(err, req, res, next) {
  console.error(err)

  const status = err.status || 500
  const message = err.message || "Internal Server Error"

  if (res && typeof res.status === "function") {
    return res.status(status).json({
      status: status,
      message: message
    })
  }

  next(err)
}

module.exports = errorHandlingMiddleware
