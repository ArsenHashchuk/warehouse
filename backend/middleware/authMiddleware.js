// /backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

// 1. Перевірка токена (Is the user logged in?)
const authenticate = (req, res, next) => {
  // Get token from the header: "Bearer <token>"
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the decoded payload { userId, role } to the request
    next(); // Pass control to the next function (the actual route)
  } catch (err) {
    res.status(400).json({ error: "Invalid token." });
  }
};

// 2. Перевірка ролей (Is the user an Admin?)
const authorize = (roles = []) => {
  return (req, res, next) => {
    // req.user was set by the authenticate middleware above
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Forbidden. Insufficient permissions." });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
