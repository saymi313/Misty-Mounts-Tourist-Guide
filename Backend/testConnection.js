const mongoose = require("mongoose");
const Admin = require("./AdminBackend/models/Admin");
require("dotenv").config();

const testConnection = async () => {
  try {
    console.log("Testing MongoDB connection...");
    console.log("MONGO_URI:", process.env.MONGO_URI);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected successfully!");

    // Check if admin exists
    const admin = await Admin.findOne({ username: "saymi313" });
    if (admin) {
      console.log("✅ Admin user found:", admin.username);
      console.log("Admin email:", admin.email);
    } else {
      console.log("❌ Admin user not found. Creating admin user...");
      
      // Create admin user
      const bcrypt = require("bcrypt");
      const hashedPassword = await bcrypt.hash("usairam1234", 10);
      
      const newAdmin = new Admin({
        username: "saymi313",
        password: hashedPassword,
        email: "saymi.usa313@gmail.com"
      });
      
      await newAdmin.save();
      console.log("✅ Admin user created successfully!");
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
};

testConnection(); 