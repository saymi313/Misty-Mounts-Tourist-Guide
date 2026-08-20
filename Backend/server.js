const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const { Server } = require("socket.io");

require("dotenv").config();

const connectDB = require("./config/db");

// Importing routes
const authRoutes = require("./AdminBackend/routes/authRoutes");
const AdminRoutes = require("./AdminBackend/routes/adminRoutes");
const feedbackRoutes = require("./UserBackend/routes/feedbackRoutes");
const paymentRoutes = require("./UserBackend/routes/paymentRoutes");
const naturalDisasterRoutes = require("./LocalGuidePannel/routes/naturalDisasterRoutes");
const userAuthRoutes = require("./LocalGuidePannel/routes/authRoutes");
const guideSpotRoutes = require("./LocalGuidePannel/routes/touristSpotRoutes");
const userRoutes = require("./UserBackend/routes/userRoutes");
const notificationRoutes = require("./UserBackend/routes/notificationRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const hotelRoutes = require("./routes/hotelRoutes");
const travelAgencyRoutes = require("./routes/travelAgencyRoutes");
const tourRoutes = require("./routes/tourRoutes");
const queryRoutes = require("./UserBackend/routes/queryRoutes");
const messageRoutes = require("./UserBackend/routes/messageRoutes");
const translateRoutes = require("./routes/translateRoutes");
const aiRoutes = require("./routes/aiRoutes");
const pushRoutes = require("./routes/pushRoutes");
const waitlistRoutes = require("./routes/waitlistRoutes");
const paymentGatewayRoutes = require("./routes/paymentGatewayRoutes");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Let REST controllers relay real-time events (e.g. new chat messages).
app.set("io", io);

// Middleware
// Security headers (HSTS, nosniff, frameguard, no x-powered-by, etc.). Allow the
// separate frontend origin to load /uploads images cross-origin.
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.disable("x-powered-by");

// Gzip every compressible response (JSON API payloads, etc.). Big win on the
// weak/slow connections common in remote northern-Pakistan travel areas —
// typical API bodies shrink 60–80% on the wire.
app.use(compression());

app.use(cors({
  origin: CLIENT_URL, // Allow frontend requests
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
}));

app.use(express.json({
  limit: "1mb",
  // Keep the raw body for the payment webhook so its signature can be verified.
  verify: (req, _res, buf) => { if (req.originalUrl.startsWith("/api/pay/webhook")) req.rawBody = buf; },
}));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
// Strip Mongo operator keys ($, .) from request payloads → blocks NoSQL injection.
app.use(mongoSanitize());

// ── Rate limiting ────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false,
  message: { error: "Too many attempts. Please try again in a few minutes." },
});
const publicWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
});
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 1000, standardHeaders: true, legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});
app.use("/api", apiLimiter); // baseline cap for every API route

// Serve uploaded files (e.g. profile avatars)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/api/health", (req, res) => res.json({ ok: true, uptime: process.uptime() }));

// Routes
app.use("/api/admin/auth", authLimiter, authRoutes);
app.use("/api/user/auth", authLimiter, userAuthRoutes);
app.use("/api/user", userRoutes);         // Profile, avatar, saved spots
app.use("/api/admin", AdminRoutes);       // Admin resource CRUD
app.use("/api/guide", guideSpotRoutes);   // Local-guide tourist-spot CRUD
app.use("/api/feedback", feedbackRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/hotel", hotelRoutes);
app.use("/api/agency", travelAgencyRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/queries", publicWriteLimiter, queryRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/translate", publicWriteLimiter, translateRoutes);
app.use("/api/ai", publicWriteLimiter, aiRoutes);
app.use("/api/push", pushRoutes);
app.use("/api/waitlist", publicWriteLimiter, waitlistRoutes);
app.use("/api/pay", paymentGatewayRoutes);
app.use("/api/natural-disaster", naturalDisasterRoutes);

// 404 for unmatched API routes
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// Central error handler — log details server-side, return a generic message so
// internal error text (schema fields, driver internals) never leaks to clients.
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack || err.message);
  const status = err.status || 500;
  res.status(status).json({ error: status === 400 ? "Bad request" : "Internal server error" });
});

// ─────────────────────────────────────────────────────────────────────────────
// Real-time messaging (1:1 traveller ↔ local guide).
//
// Sending + history live in the authenticated REST layer (/api/messages); the
// socket only carries live delivery, presence and typing. Every socket is
// authenticated with the same JWT as REST, and joins a private room named by the
// user's id, so `io.to(userId).emit(...)` reaches exactly that person's tabs.
// ─────────────────────────────────────────────────────────────────────────────
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication required"));
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    socket.data.user = { id: String(payload.id), type: payload.type };
    next();
  } catch {
    next(new Error("Invalid or expired token"));
  }
});

// Reference-counted presence: a user is "online" while ≥1 of their tabs is open.
const onlinePresence = new Map(); // userId -> open socket count

io.on("connection", (socket) => {
  const me = socket.data.user;
  socket.join(me.id);

  onlinePresence.set(me.id, (onlinePresence.get(me.id) || 0) + 1);
  if (onlinePresence.get(me.id) === 1) io.emit("presence:update", { userId: me.id, online: true });
  socket.emit("presence:list", [...onlinePresence.keys()]);

  // Let a client (re)sync the online list on demand (e.g. when a chat mounts).
  socket.on("presence:get", () => socket.emit("presence:list", [...onlinePresence.keys()]));

  // Relay typing state to the person I'm talking to.
  socket.on("typing", ({ toUserId, isTyping } = {}) => {
    if (toUserId) io.to(String(toUserId)).emit("typing", { fromUserId: me.id, isTyping: !!isTyping });
  });

  socket.on("disconnect", () => {
    const left = (onlinePresence.get(me.id) || 1) - 1;
    if (left <= 0) {
      onlinePresence.delete(me.id);
      io.emit("presence:update", { userId: me.id, online: false });
    } else {
      onlinePresence.set(me.id, left);
    }
  });
});

// Connect to MongoDB, then start the server
connectDB();
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (client: ${CLIENT_URL})`);
});
