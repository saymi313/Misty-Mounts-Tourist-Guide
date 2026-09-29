const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: Math.max(1, Math.min(100, Number(process.env.MONGO_POOL_SIZE) || 20)),
      minPoolSize: 0, waitQueueTimeoutMS: 5000, serverSelectionTimeoutMS: 10000,
      autoIndex: process.env.NODE_ENV !== 'production',
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed.");
    throw err;
  }
};

module.exports = connectDB;
