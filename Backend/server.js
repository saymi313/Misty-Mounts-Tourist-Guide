const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const cors = require('cors');
require('dotenv').config();

const authRoutes = require("./AdminBackend/routes/authRoutes");
const AdminRoutes = require("./AdminBackend/routes/adminRoutes");
const feedbackRoutes = require('./UserBackend/routes/feedbackRoutes');
const paymentRoutes = require('./UserBackend/routes/paymentRoutes');
const naturalDisasterRoutes = require("./LocalGuidePannel/routes/naturalDisasterRoutes");




const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // React app's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Allow PATCH method
  credentials: true
}));

app.use(express.json());

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

// Start Server
app.listen(PORT, () => console.log(`AdminBackend running on port ${PORT}`));
