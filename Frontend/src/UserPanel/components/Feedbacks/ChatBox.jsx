import React, { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Mountain, Bell, Check, CheckCheck } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { inputCls } from "../bento/tiles";

const ChatBox = () => {
  const { user, socket, socketConnected } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (user && socketConnected) {
      socket.emit("join-chat", { userId: user.email, username: user.name, userType: user.type });
    }

    socket.on("system-message", (message) => {
      setMessages((prev) => [...prev, {
        id: Date.now(), text: message.message, sender: "system",
        username: "System", timestamp: new Date(), type: message.type,
      }]);
    });

    socket.on("agent-message", (message) => {
      setMessages((prev) => [...prev, {
        id: message.id, text: message.text, sender: "guide",
        username: message.guideUsername || "Local Guide", timestamp: new Date(message.timestamp),
        isRead: false, isBroadcast: message.broadcastToAll || false,
      }]);
      setHasUnreadMessages(true);
    });

    socket.on("message-sent", () => {});

    socket.on("user-typing", (data) => {
      if (data.userId !== user?.email) setIsTyping(data.isTyping);
    });

    socket.on("new-message-notification", (notification) => {
      if (notification.isFromGuide) setHasUnreadMessages(true);
    });

    socket.on("message-read", () => {
      setMessages((prev) => prev.map((msg) => (msg.sender === "user" ? { ...msg, isRead: true } : msg)));
    });

    socket.on("error", (err) => {
      setMessages((prev) => [...prev, {
        id: Date.now(), text: `Error: ${err}`, sender: "system", username: "System", timestamp: new Date(),
      }]);
    });

    return () => {
      socket.off("agent-message");
      socket.off("system-message");
      socket.off("message-sent");
      socket.off("user-typing");
      socket.off("new-message-notification");
      socket.off("message-read");
      socket.off("error");
    };
  }, [user, socket, socketConnected]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && user && socketConnected) {
      socket.emit("user-message", { message: newMessage, userId: user.email, username: user.name });
      setMessages((prev) => [...prev, {
        id: Date.now(), text: newMessage, sender: "user", username: user.name,
        timestamp: new Date(), isRead: false,
      }]);
      setNewMessage("");
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }
  };

  const formatTime = (t) => new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDate = (t) => {
    const date = new Date(t);
    const today = new Date();
    const yest = new Date(today);
    yest.setDate(yest.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yest.toDateString()) return "Yesterday";
    return date.toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="flex h-full min-h-[520px] flex-col items-center justify-center rounded-[1.4rem] border border-white/[0.07] bg-night-800 p-10 text-center">
        <MessageSquare className="mb-4 h-14 w-14 text-white/25" />
        <p className="text-white/60">Please sign in to chat with a local guide.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[520px] flex-col overflow-hidden rounded-[1.4rem] border border-white/[0.07] bg-night-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-night-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-400/15 text-lime-400">
            <Mountain className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-white">Guide chat · Karim</h2>
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${socketConnected ? "bg-lime-400" : "bg-rose-400"}`} />
              <span className="text-xs text-white/50">{socketConnected ? "Online" : "Connecting…"}</span>
            </div>
          </div>
        </div>
        {hasUnreadMessages && (
          <span className="relative">
            <Bell className="h-5 w-5 text-white/70" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-lime-400" />
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto bg-night-900 p-4">
        {messages.length === 0 && (
          <p className="mt-8 text-center text-sm text-white/50">
            Say hello — your guide is ready to help plan the trip.
          </p>
        )}
        {messages.map((message, index) => {
          const showDate = index === 0 || formatDate(message.timestamp) !== formatDate(messages[index - 1]?.timestamp);
          return (
            <div key={message.id}>
              {showDate && (
                <div className="mb-4 flex justify-center">
                  <span className="rounded-full bg-night-800 px-3 py-1 text-xs text-white/50">
                    {formatDate(message.timestamp)}
                  </span>
                </div>
              )}
              <div className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                {message.sender !== "user" && message.sender !== "system" && (
                  <span className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center self-end rounded-full bg-lime-400/15 text-lime-400">
                    <Mountain className="h-4 w-4" />
                  </span>
                )}
                <div className="flex max-w-[78%] flex-col">
                  <div
                    className={`px-4 py-2.5 text-sm ${
                      message.sender === "user"
                        ? "rounded-2xl rounded-br-md bg-lime-400 text-night-950"
                        : message.sender === "system"
                        ? "rounded-xl bg-night-800 text-white/60 ring-1 ring-white/10"
                        : message.isBroadcast
                        ? "rounded-2xl rounded-bl-md border-l-4 border-lime-400 bg-night-700 text-white"
                        : "rounded-2xl rounded-bl-md bg-night-700 text-white"
                    }`}
                  >
                    {message.text}
                  </div>
                  <div className={`mt-1 flex items-center gap-1 ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                    {message.username && message.sender === "guide" && (
                      <span className="text-xs text-white/45">{message.username}</span>
                    )}
                    <span className="text-xs text-white/45">{formatTime(message.timestamp)}</span>
                    {message.sender === "user" &&
                      (message.isRead ? (
                        <CheckCheck className="h-3 w-3 text-lime-400" />
                      ) : (
                        <Check className="h-3 w-3 text-white/40" />
                      ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-night-700 px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-white/40" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-white/40" style={{ animationDelay: "0.12s" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-white/40" style={{ animationDelay: "0.24s" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/[0.06] bg-night-900 p-3">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            rows="1"
            placeholder="Type a message…"
            disabled={!socketConnected}
            className={`${inputCls} flex-1 resize-none`}
            style={{ minHeight: "46px", maxHeight: "120px" }}
          />
          <button
            type="submit"
            disabled={!socketConnected || !newMessage.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lime-400 text-night-950 transition-colors hover:bg-lime-300 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
