// Simple authentication middleware - no JWT required
const authenticateUser = (req, res, next) => {
  // For now, allow all requests through
  // In a production app, you might check session or basic auth
  next();
};

const optionalAuth = (req, res, next) => {
  // Optional authentication - always allow through
  next();
};

module.exports = { authenticateUser, optionalAuth };