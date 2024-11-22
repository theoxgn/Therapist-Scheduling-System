const auth = (req, res, next) => {
    // Basic auth middleware - expand as needed
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization required' });
    }
    next();
  };
  
  module.exports = auth;
  