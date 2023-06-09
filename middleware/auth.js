const { verifyToken } = require('../utils/token')

const validateAuth = (req, res, next) => {
  const token = req.cookies.token
  if (!token) return res.sendStatus(401)

  const user = verifyToken(token)
  if (!user) return res.sendStatus(401)

  req.user = user
  next()
}

const validateAdmin = (req, res, next) => {
  if (!req.user.isAdmin) return res.sendStatus(401)
  next()
}

module.exports = {
  validateAuth,
  validateAdmin,
}
