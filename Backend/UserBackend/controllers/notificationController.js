const Notification = require("../models/notification");

const shape = (n) => ({
  _id: n._id,
  type: n.type,
  title: n.title,
  body: n.body,
  link: n.link || "",
  read: n.read,
  time: n.createdAt,
});

/** Reusable helper so other controllers (e.g. bookings) can push a notification. */
const createNotification = (userId, data) =>
  Notification.create({ userId, ...data }).catch((err) =>
    console.error("createNotification error:", err.message)
  );

// GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const items = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50);
    res.json({ notifications: items.map(shape) });
  } catch (err) {
    res.status(500).json({ error: "Failed to load notifications" });
  }
};

// PATCH /api/notifications/:id/read
exports.markRead = async (req, res) => {
  try {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true },
      { new: true }
    );
    if (!n) return res.status(404).json({ error: "Notification not found" });
    res.json({ notification: shape(n) });
  } catch (err) {
    res.status(500).json({ error: "Failed to update notification" });
  }
};

// PATCH /api/notifications/read-all
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update notifications" });
  }
};

// DELETE /api/notifications/:id
exports.remove = async (req, res) => {
  try {
    const n = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!n) return res.status(404).json({ error: "Notification not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete notification" });
  }
};

exports.createNotification = createNotification;
