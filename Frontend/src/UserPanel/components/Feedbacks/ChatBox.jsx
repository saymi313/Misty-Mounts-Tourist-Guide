import React, { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Mountain, Bell, Check, CheckCheck } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

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
      <div className="flex h-full flex-col items-center justify-center rounded-3xl bg-frost-100 dark:bg-abyss-800 p-10 text-center">
        <MessageSquare className="mb-4 h-14 w-14 text-frost-500 dark:text-frost-400" />
        <p className="text-frost-500 dark:text-frost-400">Please sign in to chat with a local guide.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[520px] flex-col overflow-hidden rounded-3xl bg-white dark:bg-abyss-900 shadow-card ring-1 ring-abyss-900/10 dark:ring-frost-50/10">
      {/* Header */}
      <div className="flex items-center justify-between bg-abyss-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-abyss-700 text-glacier-300">
            <Mountain className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold text-frost-50">Guide chat · Karim</h2>
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${socketConnected ? "bg-glacier-400" : "bg-clay-400"}`} />
              <span className="text-xs text-frost-300">{socketConnected ? "Online" : "Connecting…"}</span>
            </div>
          </div>
        </div>
        {hasUnreadMessages && (
          <span className="relative">
            <Bell className="h-5 w-5 text-frost-100" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-glacier-400" />
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto bg-frost-100 dark:bg-abyss-800 p-4">
        {messages.length === 0 && (
          <p className="mt-8 text-center text-sm text-frost-500 dark:text-frost-400">
            Say hello — your guide is ready to help plan the trip.
          </p>
        )}
        {messages.map((message, index) => {
          const showDate = index === 0 || formatDate(message.timestamp) !== formatDate(messages[index - 1]?.timestamp);
          return (
            <div key={message.id}>
              {showDate && (
                <div className="mb-4 flex justify-center">
                  <span className="rounded-full bg-frost-100 dark:bg-abyss-800 px-3 py-1 text-xs text-frost-600 dark:text-frost-300">
                    {formatDate(message.timestamp)}
                  </span>
                </div>
              )}
              <div className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                {message.sender !== "user" && message.sender !== "system" && (
                  <span className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center self-end rounded-full bg-glacier-500/15 text-glacier-700 dark:bg-glacier-400/15 dark:text-glacier-300">
                    <Mountain className="h-4 w-4" />
                  </span>
                )}
                <div className="flex max-w-[78%] flex-col">
                  <div
                    className={`px-4 py-2.5 text-sm ${
                      message.sender === "user"
                        ? "rounded-2xl rounded-br-md bg-glacier-500 text-abyss-950"
                        : message.sender === "system"
                        ? "rounded-xl bg-sand-100 text-sand-600 ring-1 ring-sand-300/50 dark:bg-abyss-800 dark:text-sand-300"
                        : message.isBroadcast
                        ? "rounded-2xl rounded-bl-md border-l-4 border-clay-400 bg-clay-50 text-clay-700 dark:bg-abyss-800 dark:text-clay-300"
                        : "rounded-2xl rounded-bl-md bg-white text-abyss-900 shadow-sm ring-1 ring-abyss-900/10 dark:bg-abyss-900 dark:text-frost-50 dark:ring-frost-50/10"
                    }`}
                  >
                    {message.text}
                  </div>
                  <div className={`mt-1 flex items-center gap-1 ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                    {message.username && message.sender === "guide" && (
                      <span className="text-xs text-frost-500 dark:text-frost-400">{message.username}</span>
                    )}
                    <span className="text-xs text-frost-500 dark:text-frost-400">{formatTime(message.timestamp)}</span>
                    {message.sender === "user" &&
                      (message.isRead ? (
                        <CheckCheck className="h-3 w-3 text-glacier-500" />
                      ) : (
                        <Check className="h-3 w-3 text-frost-500 dark:text-frost-400" />
                      ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-white dark:bg-abyss-900 px-4 py-3 shadow-sm ring-1 ring-abyss-900/10 dark:ring-frost-50/10">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-frost-400" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-frost-400" style={{ animationDelay: "0.12s" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-frost-400" style={{ animationDelay: "0.24s" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-abyss-900/10 dark:border-frost-50/12 bg-white dark:bg-abyss-900 p-3">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            rows="1"
            placeholder="Type a message…"
            disabled={!socketConnected}
            className="flex-1 resize-none rounded-2xl border border-abyss-900/12 bg-frost-100 px-4 py-3 text-sm text-abyss-900 placeholder-frost-400 focus:border-glacier-400 focus:outline-none focus:ring-2 focus:ring-glacier-400/20 dark:border-frost-50/15 dark:bg-abyss-800 dark:text-frost-50"
            style={{ minHeight: "46px", maxHeight: "120px" }}
          />
          <button
            type="submit"
            disabled={!socketConnected || !newMessage.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-glacier-400 text-abyss-950 transition-colors hover:bg-glacier-300 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
