import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from "react";
import { Send, Check, CheckCheck, MessageSquare } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getThread, sendMessage } from "../../data/messagesApi";

/**
 * A single 1:1 conversation thread (traveller ↔ local guide). Self-contained:
 * loads its own history over REST, then stays live over the socket (new
 * messages, typing, read receipts). Text only — no calls, no attachments.
 *
 * `dark` picks the user-panel night palette; otherwise it uses slate/white
 * utilities that the guide panel's night-mode CSS layer remaps automatically.
 *
 * Props: partner {partnerId,name,avatar,type,city}, online, dark,
 *        onActivity(partnerId,{text,at}), onRead(partnerId), heightClass.
 */
export default function ChatPanel({
  partner,
  online = false,
  dark = false,
  onActivity,
  onRead,
  heightClass = "h-[600px]",
}) {
  const { user, socket, socketConnected } = useAuth();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [before, setBefore] = useState(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const activePartner = useRef(null);
  const prepending = useRef(false);

  const endRef = useRef(null);
  const typingTimer = useRef(null);
  const lastTypingSent = useRef(0);
  const partnerId = partner?.partnerId ? String(partner.partnerId) : null;
  activePartner.current = partnerId;

  const t = dark
    ? {
        panel: "bg-night-900",
        header: "border-white/[0.06] bg-night-800",
        body: "bg-night-900",
        name: "text-white",
        sub: "text-white/50",
        mine: "rounded-br-md bg-lime-400 text-night-950",
        theirs: "rounded-bl-md bg-night-700 text-white",
        stampMine: "text-lime-950/70",
        stampTheirs: "text-white/45",
        daychip: "bg-night-800 text-white/50",
        inputWrap: "border-white/[0.06] bg-night-900",
        input: "border-white/10 bg-night-800 text-white placeholder:text-white/40 focus:border-lime-400/60",
        empty: "text-white/50",
        emptyIcon: "text-white/15",
      }
    : {
        panel: "bg-white",
        header: "border-slate-100 bg-white",
        body: "bg-slate-50/40",
        name: "text-slate-900",
        sub: "text-slate-400",
        mine: "rounded-br-md bg-lime-400 text-night-950",
        theirs: "rounded-bl-md bg-slate-100 text-slate-800",
        stampMine: "text-lime-950/70",
        stampTheirs: "text-slate-400",
        daychip: "bg-slate-100 text-slate-500",
        inputWrap: "border-slate-100 bg-white",
        input: "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-lime-400",
        empty: "text-slate-400",
        emptyIcon: "text-slate-200",
      };

  const scrollToEnd = () => endRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => {
    if (prepending.current) { prepending.current = false; return; }
    scrollToEnd();
  }, [messages, partnerTyping]);

  // Load thread whenever the partner changes.
  useEffect(() => {
    if (!partnerId) return undefined;
    let alive = true;
    setLoading(true);
    setBefore(null); setLoadingOlder(false); setHistoryError('');
    getThread(partnerId)
      .then((data) => {
        if (!alive) return;
        setMessages(data.messages || []);
        setBefore(data.pagination?.before || null);
        onRead?.(partnerId);
        window.dispatchEvent(new Event("mm:messages-read")); // refresh nav badges
      })
      .catch(() => { if (alive) setMessages([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerId]);

  // Live socket wiring for this conversation.
  useEffect(() => {
    if (!socket || !partnerId) return undefined;

    const onNew = ({ message, conversation }) => {
      if (String(conversation?.partnerId) !== partnerId) return;
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      onActivity?.(partnerId, { text: message.text, at: message.at });
      if (!message.mine) {
        onRead?.(partnerId); // I'm looking at it → it's read
        window.dispatchEvent(new Event("mm:messages-read"));
      }
    };
    const onTyping = ({ fromUserId, isTyping }) => {
      if (String(fromUserId) === partnerId) setPartnerTyping(!!isTyping);
    };
    const onReadReceipt = ({ by, ids }) => {
      if (String(by) === partnerId) setMessages((prev) => prev.map((m) => (m.mine && (!ids || ids.includes(m.id)) ? { ...m, read: true } : m)));
    };

    socket.on("message:new", onNew);
    socket.on("typing", onTyping);
    socket.on("messages:read", onReadReceipt);
    return () => {
      socket.off("message:new", onNew);
      socket.off("typing", onTyping);
      socket.off("messages:read", onReadReceipt);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, partnerId]);

  const emitTyping = (isTyping) => {
    if (!socket || !socketConnected || !partnerId) return;
    socket.emit("typing", { toUserId: partnerId, isTyping });
  };

  const loadOlder = async () => {
    if (!before || loadingOlder) return;
    const current = partnerId;
    setLoadingOlder(true); setHistoryError('');
    try {
      const data = await getThread(current, { before });
      if (activePartner.current !== current) return;
      prepending.current = true;
      setMessages((prev) => [...data.messages.filter((item) => !prev.some((m) => m.id === item.id)), ...prev]);
      setBefore(data.pagination?.before || null);
    } catch { if (activePartner.current === current) setHistoryError('Could not load older messages. Try again.'); }
    finally { if (activePartner.current === current) setLoadingOlder(false); }
  };

  const onDraftChange = (v) => {
    setDraft(v);
    const now = Date.now();
    if (now - lastTypingSent.current > 1200) { emitTyping(true); lastTypingSent.current = now; }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => emitTyping(false), 1500);
  };

  const send = async (e) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || sending || !partnerId) return;
    setSending(true);
    setDraft("");
    clearTimeout(typingTimer.current);
    emitTyping(false);
    try {
      const saved = await sendMessage(partnerId, text);
      setMessages((prev) => (prev.some((m) => m.id === saved.id) ? prev : [...prev, saved]));
      onActivity?.(partnerId, { text: saved.text, at: saved.at });
    } catch {
      setDraft(text); // restore on failure
    } finally {
      setSending(false);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(e); }
  };

  const fmtTime = (v) => {
    try { return new Date(v).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); }
    catch { return ""; }
  };
  const dayLabel = (v) => {
    const d = new Date(v); const today = new Date(); const y = new Date(); y.setDate(y.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === y.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const initial = (partner?.name || "?").charAt(0).toUpperCase();

  return (
    <div className={`flex ${heightClass} flex-col overflow-hidden rounded-3xl shadow-sm ${t.panel}`}>
      {/* Header */}
      <div className={`flex shrink-0 items-center gap-3 border-b p-4 ${t.header}`}>
        <div className="relative shrink-0">
          {partner?.avatar ? (
            <img loading="lazy" decoding="async" src={partner.avatar} alt={partner.name} className="h-11 w-11 rounded-2xl object-cover" />
          ) : (
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-400/20 text-lime-500 font-bold">{initial}</span>
          )}
          {online && <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 bg-lime-500 ${dark ? "border-night-800" : "border-white"}`} />}
        </div>
        <div className="min-w-0">
          <p className={`truncate text-sm font-bold ${t.name}`}>{partner?.name || "Conversation"}</p>
          <p className={`text-xs ${t.sub}`}>
            {partnerTyping ? "Typing…" : online ? "Online now" : partner?.city || "Offline"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className={`flex-1 space-y-3 overflow-y-auto p-5 ${t.body}`}>
        {loading ? (
          <p className={`mt-8 text-center text-sm ${t.empty}`}>Loading conversation…</p>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <MessageSquare className={`mb-3 h-10 w-10 ${t.emptyIcon}`} />
            <p className={`text-sm ${t.empty}`}>No messages yet — say hello.</p>
          </div>
        ) : (
          <>
          {before && <button type="button" onClick={loadOlder} disabled={loadingOlder} className="text-sm text-lime-600">{loadingOlder ? 'Loading...' : 'Load older messages'}</button>}
          {historyError && <p role="alert" className="text-sm text-red-500">{historyError}</p>}
          {messages.map((m, i) => {
            const showDay = i === 0 || dayLabel(m.at) !== dayLabel(messages[i - 1]?.at);
            return (
              <div key={m.id}>
                {showDay && (
                  <div className="mb-3 flex justify-center">
                    <span className={`rounded-full px-3 py-1 text-xs ${t.daychip}`}>{dayLabel(m.at)}</span>
                  </div>
                )}
                <div className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.mine ? t.mine : t.theirs}`}>
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                    <span className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${m.mine ? t.stampMine : t.stampTheirs}`}>
                      {fmtTime(m.at)}
                      {m.mine && (m.read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          </>
        )}
        {partnerTyping && (
          <div className="flex justify-start">
            <div className={`rounded-2xl rounded-bl-md px-4 py-3 ${t.theirs}`}>
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-current opacity-40" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-current opacity-40" style={{ animationDelay: "0.12s" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-current opacity-40" style={{ animationDelay: "0.24s" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <form onSubmit={send} className={`flex items-center gap-2 border-t p-4 ${t.inputWrap}`}>
        <input
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={onKey}
          placeholder={socketConnected ? "Write a message…" : "Connecting…"}
          disabled={!user}
          className={`flex-1 rounded-2xl border px-4 py-3 text-sm outline-none transition-colors ${t.input}`}
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lime-400 text-night-950 transition-all hover:-translate-y-0.5 hover:bg-lime-300 disabled:opacity-40 disabled:hover:translate-y-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

ChatPanel.propTypes = {
  partner: PropTypes.shape({ partnerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), name: PropTypes.string, avatar: PropTypes.string, city: PropTypes.string, type: PropTypes.string }),
  online: PropTypes.bool, dark: PropTypes.bool, onActivity: PropTypes.func, onRead: PropTypes.func, heightClass: PropTypes.string,
};
