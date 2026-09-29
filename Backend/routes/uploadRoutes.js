const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { uploadBuffer } = require("../config/cloudinary");

const { imageUpload } = require('../middleware/imageUpload');

// POST /api/upload — any signed-in user/guide/admin uploads an image → { url }.
router.post("/", authenticate, ...imageUpload('image', 5 * 1024 * 1024), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });
    // Allow-list the folder name (alphanumeric/dash) so the client can't steer
    // the Cloudinary path (e.g. traversal or arbitrary namespaces).
    const raw = typeof req.query.folder === "string" ? req.query.folder : "";
    const safe = /^[a-z0-9_-]{1,40}$/i.test(raw) ? raw : "uploads";
    const folder = `misty-mounts/${safe}`;
    const result = await uploadBuffer(req.file.buffer, folder);
    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(err.status === 503 ? 503 : 502).json({ error: "Upload service is unavailable. Please retry." });
  } finally {
    req.releaseUpload?.();
  }
});

module.exports = router;
