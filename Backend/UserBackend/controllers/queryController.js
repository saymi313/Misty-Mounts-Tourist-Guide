const Query = require("../models/query");
const Admin = require("../../AdminBackend/models/Admin");
const { createNotification } = require("./notificationController");
const { sendReplyEmail } = require("../../utils/mailer");

// POST /api/queries — public: a traveller sends a contact message.
exports.createQuery = async (req, res) => {
  try {
    const name = (typeof req.body.name === "string" ? req.body.name : "").trim();
    const email = (typeof req.body.email === "string" ? req.body.email : "").trim();
    const message = (typeof req.body.message === "string" ? req.body.message : "").trim();
    if (!name || !email || !message) {
      return res.status(400).json({ error: "name, email and message are required" });
    }
    // Bound input to prevent storage/notification-flood abuse (public endpoint).
    if (name.length > 100 || email.length > 150 || message.length > 2000) {
      return res.status(400).json({ error: "One or more fields are too long." });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email." });
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

// POST /api/queries/:id/reply — admin emails a reply to the sender.
exports.replyQuery = async (req, res) => {
  try {
    const message = (req.body.message || "").trim();
    if (!message) return res.status(400).json({ error: "Reply message is required" });

    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ error: "Query not found" });

    try {
      await sendReplyEmail(query.email, query.name, message, query.message);
    } catch (mailErr) {
      console.error("replyQuery mail error:", mailErr.message);
      return res.status(502).json({ error: "Reply could not be emailed. Check mail settings." });
    }

    query.replies.push({ message });
    query.isRead = true;
    await query.save();
    res.json({ query });
  } catch (err) {
    console.error("replyQuery error:", err.message);
    res.status(500).json({ error: "Failed to send reply" });
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
