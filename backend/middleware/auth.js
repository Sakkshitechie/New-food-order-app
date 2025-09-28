const authenticateUser = (req, res, next) => {
  req.user = null;
  next();
};

const optionalAuth = (req, res, next) => {
  req.user = null;
  next();
};

module.exports = {
  authenticateUser,
  optionalAuth
};