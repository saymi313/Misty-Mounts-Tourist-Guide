const mongoose = require("mongoose");
const Message = require("../models/message");
const User = require("../../LocalGuidePannel/models/User");
const { createNotification } = require("./notificationController");

const PARTNER_FIELDS = "name username avatar type city";

/**
 * Resolve the (userId, guideId) pair + which side "I" am, from the authenticated
 * principal and the partner's id. Travellers own the `userId` slot; local guides
 * own the `guideId` slot. Anyone else can't use messaging.
 */
const resolvePair = (me, partnerId) => {
  if (me.type === "user") return { userId: me.id, guideId: partnerId, mySide: "user" };
  if (me.type === "local guide") return { userId: partnerId, guideId: me.id, mySide: "guide" };
  return null;
};

const shapeMessage = (doc, mySide) => ({
  id: doc._id.toString(),
  text: doc.text,
  sender: doc.sender, // 'user' | 'guide'
  mine: doc.sender === mySide,
  at: doc.createdAt,
});

// GET /api/messages/conversations — my threads, newest activity first.
exports.getConversations = async (req, res) => {
  try {
    const me = req.user;
    const isUser = me.type === "user";
    if (!isUser && me.type !== "local guide") {
      return res.status(403).json({ error: "This account can't use messaging" });
    }
    const meId = new mongoose.Types.ObjectId(me.id);
    const matchKey = isUser ? "userId" : "guideId";
    const partnerKey = isUser ? "guideId" : "userId";
    const unreadCond = isUser
      ? { $and: [{ $eq: ["$sender", "guide"] }, { $eq: ["$readByUser", false] }] }
      : { $and: [{ $eq: ["$sender", "user"] }, { $eq: ["$readByGuide", false] }] };

    const rows = await Message.aggregate([
      { $match: { [matchKey]: meId } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: `$${partnerKey}`,
          lastMessage: { $first: "$text" },
          lastAt: { $first: "$createdAt" },
          lastSender: { $first: "$sender" },
          unread: { $sum: { $cond: [unreadCond, 1, 0] } },
        },
      },
      { $sort: { lastAt: -1 } },
      { $limit: 100 },
    ]);

    const partners = await User.find({ _id: { $in: rows.map((r) => r._id) } }).select(PARTNER_FIELDS);
    const byId = Object.fromEntries(partners.map((p) => [p._id.toString(), p]));

    const conversations = rows.map((r) => {
      const p = byId[r._id.toString()];
      return {
        partnerId: r._id,
        name: p?.name || p?.username || (isUser ? "Guide" : "Traveller"),
        avatar: p?.avatar || "",
        city: p?.city || "",
        type: p?.type || "",
        lastMessage: r.lastMessage,
        lastAt: r.lastAt,
        lastSender: r.lastSender,
        unread: r.unread,
      };
    });
    res.json({ conversations });
  } catch (err) {
    console.error("getConversations error:", err.message);
    res.status(500).json({ error: "Failed to load conversations" });
  }
};

// GET /api/messages/with/:partnerId — full thread + mark incoming as read.
exports.getThread = async (req, res) => {
  try {
    const me = req.user;
    const { partnerId } = req.params;
    if (!mongoose.isValidObjectId(partnerId)) return res.status(400).json({ error: "Invalid recipient" });
    const pair = resolvePair(me, partnerId);
    if (!pair) return res.status(403).json({ error: "This account can't use messaging" });

    const docs = await Message.find({ userId: pair.userId, guideId: pair.guideId })
      .sort({ createdAt: 1 })
      .limit(500);

    // Mark messages the partner sent to me as read.
    const readField = pair.mySide === "user" ? "readByUser" : "readByGuide";
    const fromPartner = pair.mySide === "user" ? "guide" : "user";
    const marked = await Message.updateMany(
      { userId: pair.userId, guideId: pair.guideId, sender: fromPartner, [readField]: false },
      { $set: { [readField]: true } }
    );
    // Tell the sender (in real time) that I've read their messages.
    if (marked.modifiedCount > 0) {
      const io = req.app.get("io");
      if (io) io.to(String(partnerId)).emit("messages:read", { by: String(me.id) });
    }

    const partner = await User.findById(partnerId).select(PARTNER_FIELDS);
    res.json({
      partner: partner
        ? {
            partnerId: partner._id,
            name: partner.name || partner.username,
            avatar: partner.avatar || "",
            city: partner.city || "",
            type: partner.type,
          }
        : { partnerId },
      messages: docs.map((d) => shapeMessage(d, pair.mySide)),
    });
  } catch (err) {
    console.error("getThread error:", err.message);
    res.status(500).json({ error: "Failed to load conversation" });
  }
};

// POST /api/messages/with/:partnerId — send a message; relay in real time.
exports.sendMessage = async (req, res) => {
  try {
    const me = req.user;
    const { partnerId } = req.params;
    if (!mongoose.isValidObjectId(partnerId)) return res.status(400).json({ error: "Invalid recipient" });
    const pair = resolvePair(me, partnerId);
    if (!pair) return res.status(403).json({ error: "This account can't use messaging" });

    const text = (req.body.text || "").trim();
    if (!text) return res.status(400).json({ error: "Message text is required" });
    if (text.length > 4000) return res.status(400).json({ error: "Message is too long" });

    const partner = await User.findById(partnerId).select("name username avatar type");
    if (!partner) return res.status(404).json({ error: "Recipient not found" });
    // A traveller may only message a local guide, and vice-versa.
    const expected = me.type === "user" ? "local guide" : "user";
    if (partner.type !== expected) return res.status(400).json({ error: "Invalid recipient" });

    const doc = await Message.create({
      userId: pair.userId,
      guideId: pair.guideId,
      sender: pair.mySide,
      text,
      readByUser: pair.mySide === "user",
      readByGuide: pair.mySide === "guide",
    });

    const meDoc = await User.findById(me.id).select("name username avatar");
    const myName = meDoc?.name || meDoc?.username || "Someone";
    const partnerSide = pair.mySide === "user" ? "guide" : "user";

    // Real-time relay: deliver to the partner, and echo to my other tabs.
    const io = req.app.get("io");
    if (io) {
      io.to(String(partnerId)).emit("message:new", {
        message: shapeMessage(doc, partnerSide),
        conversation: { partnerId: String(me.id), name: myName, avatar: meDoc?.avatar || "" },
      });
      io.to(String(me.id)).emit("message:new", {
        message: shapeMessage(doc, pair.mySide),
        conversation: { partnerId: String(partnerId), name: partner.name || partner.username, avatar: partner.avatar || "" },
      });
    }

    // Bell notification for the recipient, deep-linking to their inbox.
    createNotification(partnerId, {
      type: "message",
      title: `New message from ${myName}`,
      body: text.slice(0, 80) + (text.length > 80 ? "…" : ""),
      link: me.type === "user" ? "/local-guide/messages" : "/messages",
    });

    res.status(201).json({ message: shapeMessage(doc, pair.mySide) });
  } catch (err) {
    console.error("sendMessage error:", err.message);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// GET /api/messages/unread-count — for the nav badge.
exports.unreadCount = async (req, res) => {
  try {
    const me = req.user;
    const isUser = me.type === "user";
    if (!isUser && me.type !== "local guide") return res.json({ count: 0 });
    const meId = new mongoose.Types.ObjectId(me.id);
    const filter = isUser
      ? { userId: meId, sender: "guide", readByUser: false }
      : { guideId: meId, sender: "user", readByGuide: false };
    res.json({ count: await Message.countDocuments(filter) });
  } catch (err) {
    console.error("unreadCount error:", err.message);
    res.json({ count: 0 });
  }
};
