import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, MessageSquare, ArrowLeft } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Home/Footer";
import ChatPanel from "../../components/chat/ChatPanel";
import usePresence from "../../hooks/usePresence";
import { useAuth } from "../../context/AuthContext";
import { getConversations } from "../../data/messagesApi";
import { getGuide } from "../../data/guidesApi";

const fmtWhen = (v) => {
  if (!v) return "";
  const d = new Date(v);
  const today = new Date();
  if (d.toDateString() === today.toDateString())
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

const MessagesPage = () => {
  const { user, socket } = useAuth();
  const online = usePresence();
  const [params] = useSearchParams();
  const toParam = params.get("to");

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

  // Load my conversations; honour a ?to=<guideId> deep link.
  useEffect(() => {
    if (!user) return;
    let alive = true;
    getConversations()
      .then(async (list) => {
        if (!alive) return;
        let next = list || [];
        if (toParam && !next.some((c) => String(c.partnerId) === String(toParam))) {
          try {
            const g = await getGuide(toParam);
            if (g) next = [{ partnerId: String(toParam), name: g.name, avatar: g.avatar || "", city: g.city || "", type: "local guide", lastMessage: "", lastAt: null, unread: 0 }, ...next];
          } catch { /* ignore */ }
        }
        setConversations(next);
        if (toParam) openConversation(toParam);
        else if (next.length && window.innerWidth >= 1024) openConversation(next[0].partnerId);
      })
      .catch(() => {});
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, toParam]);

  // Keep the conversation list live as messages arrive anywhere.
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

  if (!user) {
    return (
      <div className="min-h-screen bg-night-950 text-white">
        <Navbar />
        <main className="mx-auto flex max-w-3xl flex-col items-center px-5 py-24 text-center">
          <MessageSquare className="mb-4 h-12 w-12 text-white/25" />
          <h1 className="text-2xl font-extrabold">Sign in to view your messages</h1>
          <p className="mt-2 text-white/60">Chat with local guides about routes, weather and planning.</p>
          <Link to="/auth" className="mt-6 rounded-full bg-lime-400 px-6 py-3 text-sm font-bold text-night-950">Sign in</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-night-950 text-white selection:bg-lime-400 selection:text-night-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="mb-5 text-3xl font-extrabold tracking-tight">Messages</h1>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Conversations list */}
          <div className={`${activeId ? "hidden lg:flex" : "flex"} flex-col overflow-hidden rounded-3xl border border-white/[0.07] bg-night-900 lg:col-span-1`}>
            <div className="border-b border-white/[0.06] p-4">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-night-800 px-3 py-2.5">
                <Search className="h-4 w-4 text-white/40" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search guides"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2" style={{ maxHeight: "70vh" }}>
              {shown.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <p className="text-sm text-white/50">No conversations yet.</p>
                  <Link to="/guides" className="mt-3 inline-block text-sm font-semibold text-lime-400 hover:underline">Find a local guide →</Link>
                </div>
              ) : (
                shown.map((c) => {
                  const isActive = String(c.partnerId) === String(activeId);
                  const isOnline = online.has(String(c.partnerId));
                  return (
                    <button
                      key={c.partnerId}
                      onClick={() => openConversation(c.partnerId)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${isActive ? "bg-lime-400/10" : "hover:bg-white/5"}`}
                    >
                      <div className="relative shrink-0">
                        {c.avatar ? (
                          <img loading="lazy" decoding="async" src={c.avatar} alt={c.name} className="h-11 w-11 rounded-2xl object-cover" />
                        ) : (
                          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-400/20 font-bold text-lime-400">{(c.name || "?").charAt(0).toUpperCase()}</span>
                        )}
                        {isOnline && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-night-900 bg-lime-500" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-white">{c.name}</p>
                          <span className="shrink-0 text-xs text-white/40">{fmtWhen(c.lastAt)}</span>
                        </div>
                        <div className="mt-0.5 flex items-center justify-between gap-2">
                          <p className={`truncate text-xs ${c.unread ? "font-semibold text-white/80" : "text-white/45"}`}>
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
                <button onClick={() => setActiveId(null)} className="flex items-center gap-1.5 self-start text-sm font-semibold text-white/60 hover:text-lime-400 lg:hidden">
                  <ArrowLeft className="h-4 w-4" /> All chats
                </button>
                <ChatPanel
                  key={active.partnerId}
                  dark
                  partner={active}
                  online={online.has(String(active.partnerId))}
                  onRead={(pid) => setConversations((prev) => prev.map((c) => (String(c.partnerId) === String(pid) ? { ...c, unread: 0 } : c)))}
                  heightClass="h-[70vh]"
                />
              </div>
            ) : (
              <div className="flex h-[70vh] flex-col items-center justify-center rounded-3xl border border-white/[0.07] bg-night-900 p-10 text-center">
                <MessageSquare className="mb-4 h-12 w-12 text-white/15" />
                <p className="text-sm font-semibold text-white">Select a conversation</p>
                <p className="mt-1 text-sm text-white/50">Your chats with local guides appear here.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MessagesPage;
