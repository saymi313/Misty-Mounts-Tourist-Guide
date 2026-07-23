const Query = require("../models/query");
const Admin = require("../../AdminBackend/models/Admin");
const { createNotification } = require("./notificationController");

// POST /api/queries — public: a traveller sends a contact message.
exports.createQuery = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "name, email and message are required" });
    }
    const query = await Query.create({ name, email, message });
    // Alert admins (their notification bell + Queries badge).
    try {
      const admins = await Admin.find().select("_id");
      admins.forEach((a) =>
        createNotification(a._id, {
          type: "message",
          title: "New contact query",
          body: `${name}: ${message.slice(0, 80)}${message.length > 80 ? "…" : ""}`,
          link: "/admin/queries",
        })
      );
    } catch { /* best-effort */ }
    res.status(201).json({ message: "Message sent", query });
  } catch (err) {
    console.error("createQuery error:", err.message);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// GET /api/queries — admin: all contact queries, newest first.
exports.listQueries = async (req, res) => {
  try {
    res.json({ queries: await Query.find().sort({ createdAt: -1 }) });
  } catch (err) {
    res.status(500).json({ error: "Failed to load queries" });
  }
};

// PATCH /api/queries/:id/read — admin marks a query read (or unread).
exports.markRead = async (req, res) => {
  try {
    const isRead = "isRead" in req.body ? !!req.body.isRead : true;
    const query = await Query.findByIdAndUpdate(req.params.id, { isRead }, { new: true });
    if (!query) return res.status(404).json({ error: "Query not found" });
    res.json({ query });
  } catch (err) {
    res.status(500).json({ error: "Failed to update query" });
  }
};

// DELETE /api/queries/:id — admin removes a query.
exports.deleteQuery = async (req, res) => {
  try {
    const query = await Query.findByIdAndDelete(req.params.id);
    if (!query) return res.status(404).json({ error: "Query not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete query" });
  }
};
