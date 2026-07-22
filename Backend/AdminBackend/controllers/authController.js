const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signToken = (admin) =>
  jwt.sign({ id: admin._id, type: "admin" }, process.env.JWT_SECRET, { expiresIn: "30d" });

// Register Admin
exports.registerAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "username, email and password are required" });
    }

    const exists = await Admin.findOne({ $or: [{ username }, { email }] });
    if (exists) return res.status(409).json({ error: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ username, email, password: hashedPassword });
    await admin.save();

    res.status(201).json({ message: "Admin registered successfully", token: signToken(admin) });
  } catch (error) {
    console.error("Error in registerAdmin:", error.message);
    res.status(500).json({ error: "Failed to register admin" });
  }
};

// Login Admin
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required" });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    res.status(200).json({ message: "Login successful", token: signToken(admin) });
  } catch (error) {
    console.error("Error in loginAdmin:", error.message);
    res.status(500).json({ error: "Failed to login admin" });
  }
};
