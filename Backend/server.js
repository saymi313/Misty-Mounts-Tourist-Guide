const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const jwt = require("jsonwebtoken");
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
app.use(cors({
  origin: CLIENT_URL, // Allow frontend requests
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
}));

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (e.g. profile avatars)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/api/health", (req, res) => res.json({ ok: true, uptime: process.uptime() }));

// Routes
app.use("/api/admin/auth", authRoutes);
app.use("/api/user/auth", userAuthRoutes);
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
app.use("/api/queries", queryRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/translate", translateRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/natural-disaster", naturalDisasterRoutes);

// 404 for unmatched API routes
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// Central error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
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
    const payload = jwt.verify(token, process.env.JWT_SECRET);
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
