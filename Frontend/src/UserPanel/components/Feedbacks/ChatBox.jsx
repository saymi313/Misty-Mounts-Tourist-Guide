import React, { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, User, Bell, Check, CheckCheck } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const ChatBox = () => {
  const { user, socket, socketConnected } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Join chat when component mounts and user is authenticated and socket is connected
    if (user && socketConnected) {
      console.log('ChatBox: Joining chat with user:', user);
      socket.emit("join-chat", {
        userId: user.email, // Use email as userId
        username: user.name,
        userType: user.type
      });
    }

    // Listen for system messages
    socket.on("system-message", (message) => {
      console.log('ChatBox: Received system message:', message);
      setMessages((prev) => [
        ...prev,
        { 
          id: Date.now(), 
          text: message.message, 
          sender: "system",
          username: "System",
          timestamp: new Date(),
          type: message.type
        },
      ]);
    });

    // Listen for agent messages from the server
    socket.on("agent-message", (message) => {
      console.log("ChatBox: Received agent message:", message);
      setMessages((prev) => [
        ...prev,
        { 
          id: message.id, 
          text: message.text, 
          sender: "guide",
          username: message.guideUsername || "Local Guide",
          timestamp: new Date(message.timestamp),
          isRead: false,
          isBroadcast: message.broadcastToAll || false
        },
      ]);
      setHasUnreadMessages(true);
    });

    // Listen for message confirmation
    socket.on("message-sent", (message) => {
      console.log("ChatBox: Message sent successfully:", message);
    });

    // Listen for typing indicators
    socket.on("user-typing", (data) => {
      if (data.userId !== user?.email) {
        setIsTyping(data.isTyping);
      }
    });

    // Listen for new message notifications
    socket.on("new-message-notification", (notification) => {
      if (notification.isFromGuide) {
        setHasUnreadMessages(true);
        // Show browser notification if permission granted
        if (Notification.permission === "granted") {
          new Notification("New Message from Guide", {
            body: notification.message,
            icon: "/Logo.png"
          });
        }
      }
    });

    // Listen for message read status
    socket.on("message-read", (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.sender === "user" ? { ...msg, isRead: true } : msg
        )
      );
    });

    // Listen for errors
    socket.on("error", (error) => {
      console.error("ChatBox: Socket error:", error);
      setMessages((prev) => [
        ...prev,
        { 
          id: Date.now(), 
          text: `Error: ${error}`, 
          sender: "system",
          username: "System",
          timestamp: new Date()
        },
      ]);
    });

    // Request notification permission
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Cleanup the socket listeners when the component unmounts
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
      console.log("ChatBox: Sending message:", newMessage);
      
      // Send user message to the server with user information
      socket.emit("user-message", {
        message: newMessage,
        userId: user.email,
        username: user.name
      });

      // Add message to local state
      setMessages((prev) => [
        ...prev,
        { 
          id: Date.now(), 
          text: newMessage, 
          sender: "user",
          username: user.name,
          timestamp: new Date(),
          isRead: false
        },
      ]);
      setNewMessage("");
      inputRef.current?.focus();
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (user && socketConnected) {
      socket.emit("typing", {
        isTyping: e.target.value.length > 0,
        userId: user.email,
        username: user.name
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50">
        <MessageSquare className="h-16 w-16 text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">Please log in to start chatting</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">Travel Guide Chat</h2>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-blue-100 text-sm">
                {socketConnected ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
        {hasUnreadMessages && (
          <div className="relative">
            <Bell className="h-6 w-6 text-white animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
        )}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
        {messages.map((message, index) => {
          const showDate = index === 0 || 
            formatDate(message.timestamp) !== formatDate(messages[index - 1]?.timestamp);
          
          return (
            <div key={message.id}>
              {showDate && (
                <div className="flex justify-center mb-4">
                  <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {formatDate(message.timestamp)}
                  </span>
                </div>
              )}
              
              <div className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                {message.sender !== "user" && (
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col">
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.sender === "user"
                        ? "bg-blue-800 text-white rounded-br-md"
                        : message.sender === "system"
                        ? "bg-yellow-100 text-yellow-800 rounded-lg"
                        : message.isBroadcast
                        ? "bg-purple-100 text-purple-800 border-l-4 border-purple-500 rounded-lg"
                        : "bg-gray-200 text-gray-800 rounded-bl-md shadow-sm"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                  
                  {message.username && message.sender !== "user" && (
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">{message.username}</span>
                      {message.isBroadcast && (
                        <span className="text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded-full">
                          Broadcast
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className={`flex items-center space-x-1 mt-1 ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}>
                    <span className="text-xs text-gray-500">
                      {formatTime(message.timestamp)}
                    </span>
                    {message.sender === "user" && (
                      <div className="flex items-center">
                        {message.isRead ? (
                          <CheckCheck className="h-3 w-3 text-blue-500" />
                        ) : (
                          <Check className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 px-4 py-2 rounded-2xl rounded-bl-md shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Type a message..."
              rows="1"
              disabled={!socketConnected}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          <button
            type="submit"
            disabled={!socketConnected || !newMessage.trim()}
            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
