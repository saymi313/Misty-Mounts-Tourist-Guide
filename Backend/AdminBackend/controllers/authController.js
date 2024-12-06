const Admin = require("../models/Admin");
const bcrypt = require('bcrypt'); // Using bcryptjs for password hashing
const jwt = require("jsonwebtoken");

// Register Admin
exports.registerAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Username: ", username);
    console.log("Plain Password: ", password);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed Password: ", hashedPassword);

    // Create admin
    const admin = new Admin({ username, password: hashedPassword });
    await admin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    console.error("Error in registerAdmin:", error);
    res.status(500).json({ error: "Failed to register admin" });
  }
};

// Login Admin
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Incoming Username: ", username);
    console.log("Incoming Plain Password: ", password);

    // Check if admin exists
    const admin = await Admin.findOne({ username });
    console.log("Admin Found: ", admin);
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    // Log the stored hashed password for debugging purposes
    console.log("Stored Hashed Password: ", admin.password);

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password);
    console.log("Password Match Result: ", isMatch); // This will be true if passwords match

    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    // Generate JWT
    const token = jwt.sign({ id: admin._id }, "your-secret-key", { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error in loginAdmin:", error);
    res.status(500).json({ error: "Failed to login admin" });
  }
};
