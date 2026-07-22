import React, { useState, useEffect, useRef } from "react";
import { Send, Search, Phone, Video, MoreVertical, MessageSquare } from "lucide-react";
import GuideLayout from "../GuideLayout";
import { feedbacks, img } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";
import { LIVE } from "../../data/api";

// ── Mock conversations (dummy mode only) ──────────────────────────────────────
const seedConversations = [
  {
    id: "c1", userId: "c1", name: feedbacks[0].name, avatar: feedbacks[0].avatar,
    online: true, unread: 2, time: "09:24",
    snippet: "That sunrise boat ride sounds perfect — can we book it?",
    messages: [
      { id: "m1", from: "them", text: "Hi! We're arriving in Hunza next Friday.", time: "09:10" },
      { id: "m2", from: "me", text: "Welcome! I can plan the whole valley for you.", time: "09:12" },
      { id: "m3", from: "them", text: "Amazing. Is Attabad Lake worth an early start?", time: "09:20" },
      { id: "m4", from: "me", text: "Absolutely — a sunrise boat ride is the highlight.", time: "09:22" },
      { id: "m5", from: "them", text: "That sunrise boat ride sounds perfect — can we book it?", time: "09:24" },
    ],
  },
  {
    id: "c2", userId: "c2", name: feedbacks[1].name, avatar: feedbacks[1].avatar,
    online: false, unread: 0, time: "Yesterday",
    snippet: "Thanks for the Deosai tips, we spotted a bear!",
    messages: [
      { id: "m1", from: "them", text: "Heading to Skardu — any camping advice for Deosai?", time: "Tue" },
      { id: "m2", from: "me", text: "Camp near Sheosar Lake and keep warm — it drops below zero.", time: "Tue" },
      { id: "m3", from: "them", text: "Thanks for the Deosai tips, we spotted a bear!", time: "Yesterday" },
    ],
  },
  {
    id: "c3", userId: "c3", name: feedbacks[2].name, avatar: feedbacks[2].avatar,
    online: true, unread: 1, time: "08:02",
    snippet: "Is the Fairy Meadows jeep track open right now?",
    messages: [{ id: "m1", from: "them", text: "Is the Fairy Meadows jeep track open right now?", time: "08:02" }],
  },
];

const fmt = (t) => {
  try {
    return new Date(t).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};
const nowTime = () => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
const avatarFor = (name) => img(`avatar-${(name || "traveller").toLowerCase().replace(/\s+/g, "-")}`, 120, 120);

const Messages = () => {
  const { user, socket, socketConnected } = useAuth();
  const [conversations, setConversations] = useState(() => (LIVE ? [] : seedConversations));
  const [activeId, setActiveId] = useState(() => (LIVE ? null : seedConversations[0].id));
  const [draft, setDraft] = useState("");
  const activeRef = useRef(activeId);
  activeRef.current = activeId;

  // Upsert an incoming message into the conversation keyed by userId.
  const upsert = (prev, userId, username, msg) => {
    const idx = prev.findIndex((c) => c.userId === userId);
    if (idx === -1) {
      return [
        {
          userId, id: userId, name: username || userId, avatar: avatarFor(username),
          online: true, unread: activeRef.current === userId ? 0 : 1, time: msg.time, snippet: msg.text, messages: [msg],
        },
        ...prev,
      ];
    }
    return prev.map((c, i) =>
      i === idx
        ? {
            ...c,
            snippet: msg.text,
            time: msg.time,
            unread: activeRef.current === c.id ? 0 : (c.unread || 0) + (msg.from === "them" ? 1 : 0),
            messages: [...c.messages, msg],
          }
        : c
    );
  };

  // ── Live socket wiring (guide side) ─────────────────────────────────────────
  useEffect(() => {
    if (!LIVE || !user) return undefined;
    if (socketConnected) {
      socket.emit("join-chat", { userId: user.email, username: user.name, userType: "local guide" });
    }

    const onActiveUsers = (users) => {
      const travellers = (users || []).filter((u) => u.userType === "user");
      const online = new Set(travellers.map((u) => u.userId));
      setConversations((prev) => {
        let next = prev.map((c) => ({ ...c, online: online.has(c.userId) }));
        travellers.forEach((u) => {
          if (!next.find((c) => c.userId === u.userId)) {
            next = [
              { userId: u.userId, id: u.userId, name: u.username || u.userId, avatar: avatarFor(u.username), online: true, unread: 0, time: "", snippet: "Active now", messages: [] },
              ...next,
            ];
          }
        });
        return next;
      });
    };

    const onUserMessage = (m) => {
      setConversations((prev) => upsert(prev, m.userId, m.username, { id: m.id, from: "them", text: m.text, time: fmt(m.timestamp) }));
    };

    const onHistory = ({ userId, messages }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.userId === userId
            ? { ...c, messages: (messages || []).map((m) => ({ id: m.id, from: m.sender === "guide" ? "me" : "them", text: m.text, time: fmt(m.timestamp) })) }
            : c
        )
      );
    };

    const onDisconnected = ({ userId }) =>
      setConversations((prev) => prev.map((c) => (c.userId === userId ? { ...c, online: false } : c)));

    socket.on("active-users", onActiveUsers);
    socket.on("user-message", onUserMessage);
    socket.on("message-history", onHistory);
    socket.on("user-disconnected", onDisconnected);
    return () => {
      socket.off("active-users", onActiveUsers);
      socket.off("user-message", onUserMessage);
      socket.off("message-history", onHistory);
      socket.off("user-disconnected", onDisconnected);
    };
  }, [user, socket, socketConnected]);

  const active = conversations.find((c) => c.id === activeId) || null;

  const openChat = (id) => {
    setActiveId(id);
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
    if (LIVE) {
      const conv = conversations.find((c) => c.id === id);
      if (conv) socket.emit("get-message-history", { userId: user.email, otherUserId: conv.userId });
    }
  };

  const send = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !active) return;
    const time = nowTime();
    if (LIVE) {
      socket.emit("agent-message", { targetUserId: active.userId, message: text, guideUsername: user.name });
    }
    setConversations((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? { ...c, snippet: text, time, messages: [...c.messages, { id: `me-${Date.now()}`, from: "me", text, time }] }
          : c
      )
    );
    setDraft("");
  };

  return (
    <GuideLayout greeting="Messages" subtitle="Chat with travellers planning their trip">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* LEFT — conversations list */}
        <div className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm lg:col-span-1">
          <div className="border-b border-slate-100 p-4">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
              <Search className="h-4 w-4 text-slate-400" />
              <input placeholder="Search conversations" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {conversations.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-slate-400">
                No conversations yet. Travellers appear here when they message you.
              </p>
            )}
            {conversations.map((c) => {
              const isActive = c.id === activeId;
              return (
                <button
                  key={c.id}
                  onClick={() => openChat(c.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${isActive ? "bg-emerald-50" : "hover:bg-slate-50"}`}
                >
                  <div className="relative shrink-0">
                    <img src={c.avatar} alt={c.name} className="h-11 w-11 rounded-2xl object-cover" />
                    {c.online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900">{c.name}</p>
                      <span className="shrink-0 text-xs text-slate-400">{c.time}</span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <p className={`truncate text-xs ${c.unread ? "font-semibold text-slate-700" : "text-slate-400"}`}>{c.snippet}</p>
                      {c.unread > 0 && (
                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-xs font-semibold text-white">{c.unread}</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT — chat thread */}
        <div className="flex h-[600px] flex-col overflow-hidden rounded-3xl bg-white shadow-sm lg:col-span-2">
          {!active ? (
            <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
              <MessageSquare className="mb-4 h-12 w-12 text-slate-200" />
              <p className="text-sm font-semibold text-slate-900">Select a conversation</p>
              <p className="mt-1 text-sm text-slate-400">
                {LIVE ? "Traveller messages will land here in real time." : "Pick a chat from the left."}
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={active.avatar} alt={active.name} className="h-11 w-11 rounded-2xl object-cover" />
                    {active.online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{active.name}</p>
                    <p className="text-xs text-slate-400">{active.online ? "Online now" : "Offline"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <button className="rounded-full p-2 transition-colors hover:bg-slate-50 hover:text-emerald-600"><Phone className="h-4 w-4" /></button>
                  <button className="rounded-full p-2 transition-colors hover:bg-slate-50 hover:text-emerald-600"><Video className="h-4 w-4" /></button>
                  <button className="rounded-full p-2 transition-colors hover:bg-slate-50 hover:text-emerald-600"><MoreVertical className="h-4 w-4" /></button>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/40 p-5">
                {active.messages.length === 0 && (
                  <p className="mt-8 text-center text-sm text-slate-400">No messages yet — say hello.</p>
                )}
                {active.messages.map((m) => {
                  const mine = m.from === "me";
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${mine ? "rounded-br-md bg-emerald-500 text-white" : "rounded-bl-md bg-slate-100 text-slate-800"}`}>
                        <p>{m.text}</p>
                        <p className={`mt-1 text-[10px] ${mine ? "text-emerald-50/80" : "text-slate-400"}`}>{m.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={send} className="flex items-center gap-2 border-t border-slate-100 p-4">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write a message…"
                  className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-400"
                />
                <button type="submit" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-600">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </GuideLayout>
  );
};

export default Messages;
