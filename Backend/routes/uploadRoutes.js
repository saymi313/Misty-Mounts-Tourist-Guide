const express = require("express");
const multer = require("multer");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { uploadBuffer } = require("../config/cloudinary");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

// POST /api/upload — any signed-in user/guide/admin uploads an image → { url }.
router.post("/", authenticate, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });
    const folder = req.query.folder ? `misty-mounts/${req.query.folder}` : "misty-mounts/uploads";
    const result = await uploadBuffer(req.file.buffer, folder);
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error("upload error:", err.message);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
