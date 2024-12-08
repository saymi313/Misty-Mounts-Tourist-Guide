const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();

// Importing your routes
const authRoutes = require("./AdminBackend/routes/authRoutes");
const AdminRoutes = require("./AdminBackend/routes/adminRoutes");
const feedbackRoutes = require('./UserBackend/routes/feedbackRoutes');
const paymentRoutes = require('./UserBackend/routes/paymentRoutes');
const naturalDisasterRoutes = require("./LocalGuidePannel/routes/naturalDisasterRoutes");




const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // React frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = 5000;

// Active users storage
let activeUsers = {}; // Store active users with their socket IDs

// Middleware
app.use(cors({
  origin: "http://localhost:5173", // Allow frontend requests
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Allow PATCH method
  credentials: true,
}));

app.use(express.json()); // Parse incoming JSON data

// Routes
app.use("/api/admin/auth", authRoutes);
app.use("/api/admin", AdminRoutes); // Mount the spot routes
app.use('/api/feedback', feedbackRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/natural-disaster", naturalDisasterRoutes); // Natural disaster routes
// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// Socket.IO Setup
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle user joining the chat
  socket.on("join-chat", (userId) => {
    activeUsers[socket.id] = userId; // Save the userId with socket ID
    console.log(`User ${userId} joined`);
    // Emit the updated active users list to all connected clients (local guides)
    io.emit("active-users", Object.values(activeUsers));
  });

  // Handle user messages
  socket.on("user-message", (message) => {
    console.log("Message from user:", message);
    // Broadcast the user message to all connected local guides
    io.emit("user-message", message);
  });

  // Handle sending agent's response to the user
  socket.on("agent-message", (messageData) => {
    const { userId, message } = messageData;
    console.log("Agent response to user:", userId, message);
    // Emit agent's message to the specific user
    socket.emit("agent-message", message);
  });

  // Handle disconnect event
  socket.on("disconnect", () => {
    const userId = activeUsers[socket.id];
    console.log(`User ${userId} disconnected`);
    delete activeUsers[socket.id]; // Remove from active users
    io.emit("active-users", Object.values(activeUsers)); // Emit updated active users list
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
