const Notification = require("../models/notification");
const { sendPushToUser } = require("../../utils/webpush");

const shape = (n) => ({
  _id: n._id,
  type: n.type,
  title: n.title,
  body: n.body,
  link: n.link || "",
  read: n.read,
  time: n.createdAt,
});

/** Reusable helper so other controllers (e.g. bookings) can push a notification.
 * Also fires a Web-Push to the user's devices (no-op when push isn't configured). */
const createNotification = (userId, data) =>
  (require('../../utils/deliveryJobs').enabled()
    ? require('../../utils/deliveryJobs').queueNotification(userId, data)
    : Notification.create({ userId, ...data }))
    .then((n) => {
      if (!require('../../utils/deliveryJobs').enabled()) sendPushToUser(userId, {
        title: data.title || "Misty Mounts",
        body: data.body || "",
        link: data.link || "/notifications",
      });
      return n;
    })
    .catch((err) => console.error("createNotification error:", err.message));

// GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const { page, limit, skip } = require('../../utils/pagination').pagination(req.query);
    const items = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1, _id: -1 })
      .skip(skip).limit(limit + 1).lean().maxTimeMS(5000);
    res.json({ notifications: items.slice(0, limit).map(shape), pagination: { page, limit, hasMore: items.length > limit } });
  } catch (err) {
    if (err.status === 400) return res.status(400).json({ error: err.message });
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
