const mongoose = require("mongoose");
const User = require("./LocalGuidePannel/models/User");
require("dotenv").config();

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if test user already exists
    const existingUser = await User.findOne({ email: "test@example.com" });
    if (existingUser) {
      console.log("Test user already exists!");
      console.log("Email: test@example.com");
      console.log("Password: password123");
      console.log("Type: user");
      process.exit(0);
    }

    // Create new test user
    const testUser = new User({
      email: "test@example.com",
      username: "testuser",
      password: "password123",
      type: "user"
    });

    await testUser.save();
    console.log("Test user created successfully!");
    console.log("Email: test@example.com");
    console.log("Password: password123");
    console.log("Type: user");

    // Create a test local guide
    const existingGuide = await User.findOne({ email: "guide@example.com" });
    if (!existingGuide) {
      const testGuide = new User({
        email: "guide@example.com",
        username: "testguide",
        password: "password123",
        type: "local guide"
      });

      await testGuide.save();
      console.log("Test guide created successfully!");
      console.log("Email: guide@example.com");
      console.log("Password: password123");
      console.log("Type: local guide");
    } else {
      console.log("Test guide already exists!");
    }

  } catch (error) {
    console.error("Error creating test user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
};

createTestUser(); 