const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// Admin Login
const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    let admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

module.exports = { loginAdmin };
