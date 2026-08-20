import React, { useEffect, useRef, useState } from "react";
import { Search, MessageSquare, ArrowLeft } from "lucide-react";
import GuideLayout from "../GuideLayout";
import ChatPanel from "../../components/chat/ChatPanel";
import usePresence from "../../hooks/usePresence";
import { useAuth } from "../../context/AuthContext";
import { getConversations } from "../../data/messagesApi";

const fmtWhen = (v) => {
  if (!v) return "";
  const d = new Date(v);
  const today = new Date();
  if (d.toDateString() === today.toDateString())
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

const Messages = () => {
  const { user, socket } = useAuth();
  const online = usePresence();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState("");
  const activeRef = useRef(null);
  activeRef.current = activeId;

  const openConversation = (pid) => {
    const id = String(pid);
    setActiveId(id);
    setConversations((prev) => prev.map((c) => (String(c.partnerId) === id ? { ...c, unread: 0 } : c)));
  };

  useEffect(() => {
    if (!user) return;
    getConversations().then(setConversations).catch(() => {});
  }, [user]);

  // Keep the list live as messages come in.
  useEffect(() => {
    if (!socket) return undefined;
    const onNew = ({ message, conversation }) => {
      const pid = String(conversation?.partnerId);
      const isActive = pid === activeRef.current;
      setConversations((prev) => {
        const idx = prev.findIndex((c) => String(c.partnerId) === pid);
        if (idx === -1) {
          return [
            { partnerId: pid, name: conversation.name, avatar: conversation.avatar || "", lastMessage: message.text, lastAt: message.at, unread: !message.mine && !isActive ? 1 : 0 },
            ...prev,
          ];
        }
        const cur = prev[idx];
        const updated = {
          ...cur,
          lastMessage: message.text,
          lastAt: message.at,
          unread: message.mine || isActive ? (isActive ? 0 : cur.unread || 0) : (cur.unread || 0) + 1,
        };
        return [updated, ...prev.filter((_, i) => i !== idx)];
      });
    };
    socket.on("message:new", onNew);
    return () => socket.off("message:new", onNew);
  }, [socket]);

  const active = conversations.find((c) => String(c.partnerId) === String(activeId)) || null;
  const shown = query
    ? conversations.filter((c) => (c.name || "").toLowerCase().includes(query.toLowerCase()))
    : conversations;

  return (
    <GuideLayout greeting="Messages" subtitle="Chat with travellers planning their trip">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Conversations list */}
        <div className={`${activeId ? "hidden lg:flex" : "flex"} flex-col overflow-hidden rounded-3xl bg-white shadow-sm lg:col-span-1`}>
          <div className="border-b border-slate-100 p-4">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search travellers"
                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2" style={{ maxHeight: "70vh" }}>
            {shown.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-slate-400">
                No conversations yet. Travellers appear here when they message you.
              </p>
            ) : (
              shown.map((c) => {
                const isActive = String(c.partnerId) === String(activeId);
                const isOnline = online.has(String(c.partnerId));
                return (
                  <button
                    key={c.partnerId}
                    onClick={() => openConversation(c.partnerId)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${isActive ? "bg-lime-50" : "hover:bg-slate-50"}`}
                  >
                    <div className="relative shrink-0">
                      {c.avatar ? (
                        <img loading="lazy" decoding="async" src={c.avatar} alt={c.name} className="h-11 w-11 rounded-2xl object-cover" />
                      ) : (
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-100 font-bold text-lime-600">{(c.name || "?").charAt(0).toUpperCase()}</span>
                      )}
                      {isOnline && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-lime-500" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900">{c.name}</p>
                        <span className="shrink-0 text-xs text-slate-400">{fmtWhen(c.lastAt)}</span>
                      </div>
                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        <p className={`truncate text-xs ${c.unread ? "font-semibold text-slate-700" : "text-slate-400"}`}>
                          {c.lastMessage || "Start the conversation"}
                        </p>
                        {c.unread > 0 && (
                          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-lime-400 px-1.5 text-xs font-bold text-night-950">{c.unread}</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Thread */}
        <div className={`${activeId ? "flex" : "hidden lg:flex"} flex-col lg:col-span-2`}>
          {active ? (
            <div className="flex flex-col gap-2">
              <button onClick={() => setActiveId(null)} className="flex items-center gap-1.5 self-start text-sm font-semibold text-slate-500 hover:text-lime-600 lg:hidden">
                <ArrowLeft className="h-4 w-4" /> All chats
              </button>
              <ChatPanel
                key={active.partnerId}
                partner={active}
                online={online.has(String(active.partnerId))}
                onRead={(pid) => setConversations((prev) => prev.map((c) => (String(c.partnerId) === String(pid) ? { ...c, unread: 0 } : c)))}
                heightClass="h-[600px]"
              />
            </div>
          ) : (
            <div className="flex h-[600px] flex-col items-center justify-center rounded-3xl bg-white p-10 text-center shadow-sm">
              <MessageSquare className="mb-4 h-12 w-12 text-slate-200" />
              <p className="text-sm font-semibold text-slate-900">Select a conversation</p>
              <p className="mt-1 text-sm text-slate-400">Traveller messages land here in real time.</p>
            </div>
          )}
        </div>
      </div>
    </GuideLayout>
  );
};

export default Messages;
