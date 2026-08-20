const jwt = require("jsonwebtoken");

/**
 * Shared auth middleware for all three panels. Every panel signs a JWT with the
 * same JWT_SECRET and a payload of `{ id, type }` where type ∈
 * "admin" | "user" | "local guide". `authenticate` verifies it and attaches
 * `req.user`; `requireRole(...)` gates by type.
 */
const authenticate = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Authentication required" });
  try {
    // Pin the algorithm so a forged token can't downgrade to "none"/alg-confusion.
    req.user = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] }); // { id, type, iat, exp }
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.type)) {
    return res.status(403).json({ error: "Forbidden — insufficient permissions" });
  }
  next();
};

const requireAdmin = requireRole("admin");
const requireGuide = requireRole("local guide");

module.exports = { authenticate, requireRole, requireAdmin, requireGuide };
