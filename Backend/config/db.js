const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    console.error("The API is running, but database operations will fail until MongoDB is reachable.");
  }
};

module.exports = connectDB;
