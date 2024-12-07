const jwt = require("jsonwebtoken");

// Middleware to authenticate user
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Expecting Bearer <token>
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure you have JWT_SECRET in .env
    req.user = decoded; // Attach user data to request object
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = { authenticateUser };
