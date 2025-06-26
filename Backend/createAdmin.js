const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("./AdminBackend/models/Admin");
require("dotenv").config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: "saymi313" });
    if (existingAdmin) {
      console.log("Admin user already exists!");
      process.exit(0);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash("usairam1234", 10);

    // Create new admin
    const admin = new Admin({
      username: "saymi313",
      password: hashedPassword,
      email: "saymi.usa313@gmail.com"
    });

    await admin.save();
    console.log("Admin user created successfully!");
    console.log("Username: saymi313");
    console.log("Password: usairam1234");
    console.log("Email: saymi.usa313@gmail.com");

  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
};

createAdmin(); 