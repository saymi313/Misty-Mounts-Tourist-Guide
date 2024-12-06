const express = require("express");
const bcrypt = require("bcrypt");
const Admin = require("./AdminBackend/models/Admin");
const mongoose = require("mongoose");
const authRoutes = require("./AdminBackend/routes/authRoutes");
const AdminRoutes = require("./AdminBackend/routes/adminRoutes"); // Ensure this is correct

const cors = require('cors');


const app = express();
const PORT = 5000;
require('dotenv').config();

app.use(cors({
  origin: 'http://localhost:5173', // React app's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Allow PATCH method
  credentials: true
}));


// Middleware
app.use(express.json());

// Routes
app.use("/api/admin/auth", authRoutes);
app.use("/api/admin", AdminRoutes); // Mount the spot routes

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

//   const createAdmin = async () => {
//     try {
//       const adminExist = await Admin.findOne({ username: "admin" });
//       if (!adminExist) {
//         const hashedPassword = await bcrypt.hash("adminPassword", 10); // Set your password here
//         const newAdmin = new Admin({
//           username: "admin", // Set the username
//           password: hashedPassword, // Set the hashed password
//         });
  
//         await newAdmin.save();
//         console.log("Admin created successfully");
//       } else {
//         console.log("Admin already exists");
//       }
//     } catch (error) {
//       console.error("Error creating admin:", error.message);
//     }
//   };
  
//   // Call the function to create admin if it doesn't exist
//   createAdmin();
  
// Start Server
app.listen(PORT, () => console.log(`AdminBackend running on port ${PORT}`));
