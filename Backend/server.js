require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./AdminBackend/routes/authRoutes");

const app = express();

// Connect to the database
connectDB();

// Middleware to parse JSON
app.use(express.json());

// Use the auth routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", authRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
