import React, { useState, useEffect, useRef } from "react";
import { Send, User, MessageSquare, Bell, Check, CheckCheck, Users, Search, Trash2, Globe, UserCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Chatbot = () => {
  const { user, socket, socketConnected } = useAuth();
  const [messages, setMessages] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [users, setUsers] = useState([]); // Active users list
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const [showUserList, setShowUserList] = useState(true);
  const [messageTarget, setMessageTarget] = useState("specific"); // "specific" or "all"
  const [deletedChats, setDeletedChats] = useState([]);
  const [allMessages, setAllMessages] = useState({}); // Store messages per user
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Debug: Log allMessages changes
  useEffect(() => {
    console.log("allMessages updated:", allMessages);
    console.log("Object.keys(allMessages):", Object.keys(allMessages));
  }, [allMessages]);

  // Join chat and fetch active users
  useEffect(() => {
    if (user && socketConnected) {
      console.log('Chatbot: Joining chat with user:', user);
      socket.emit("join-chat", {
        userId: user.email,
        username: user.name,
        userType: user.type
      });
    }

    socket.on("active-users", (activeUsers) => {
      console.log("Chatbot: Received active users:", activeUsers);
      // Filter to show only regular users (not other guides)
      const regularUsers = activeUsers.filter(user => user.userType === 'user');
      setUsers(regularUsers);
    });

    // Listen for system messages
    socket.on("system-message", (message) => {
      console.log('Chatbot: Received system message:', message);
      setMessages((prev) => [
        ...prev,
        { 
          id: Date.now(), 
          text: message.message, 
          sender: "system",
          username: "System"
        },
      ]);
    });

    // Listen for incoming messages from users
    socket.on("user-message", (messageData) => {
      console.log("Chatbot: Received user message:", messageData);
      
      // Add message to all messages storage
      setAllMessages(prev => {
        const newAllMessages = {
          ...prev,
          [messageData.userId]: [...(prev[messageData.userId] || []), {
            id: messageData.id, 
            text: messageData.text, 
            sender: "user",
            username: messageData.username,
            userId: messageData.userId,
            timestamp: new Date(messageData.timestamp)
          }]
        };
        console.log("Updated allMessages:", newAllMessages);
        return newAllMessages;
      });
      
      // If this user is currently selected, add to current messages
      if (currentUserId === messageData.userId) {
        setMessages(prev => [
          ...prev,
          { 
            id: messageData.id, 
            text: messageData.text, 
            sender: "user",
            username: messageData.username,
            userId: messageData.userId,
            timestamp: new Date(messageData.timestamp)
          },
        ]);
      }
      
      // Update unread count
      setUnreadCounts(prev => ({
        ...prev,
        [messageData.userId]: (prev[messageData.userId] || 0) + 1
      }));
    });

    // Listen for message confirmation
    socket.on("message-sent", (message) => {
      console.log("Chatbot: Message sent successfully:", message);
    });

    // Listen for typing indicators
    socket.on("user-typing", (data) => {
      if (data.userId === currentUserId) {
        setIsTyping(data.isTyping);
      }
    });

    // Listen for user disconnections
    socket.on("user-disconnected", (userData) => {
      setUsers(prev => prev.filter(u => u.userId !== userData.userId));
      if (currentUserId === userData.userId) {
        setCurrentUserId(null);
        setMessages([]);
      }
    });

    // Listen for new message notifications
    socket.on("new-message-notification", (notification) => {
      // Show browser notification if permission granted
      if (Notification.permission === "granted") {
        new Notification(`New message from ${notification.from}`, {
          body: notification.message,
          icon: "/Logo.png"
        });
      }
    });

    // Listen for chat deletion confirmation
    socket.on("chat-deleted", (data) => {
      console.log("Chatbot: Chat deleted:", data);
      setDeletedChats(prev => [...prev, data.targetUserId]);
      if (currentUserId === data.targetUserId) {
        setCurrentUserId(null);
        setMessages([]);
      }
      // Remove messages from all messages storage
      setAllMessages(prev => {
        const newAllMessages = { ...prev };
        delete newAllMessages[data.targetUserId];
        return newAllMessages;
      });
    });

    // Listen for errors
    socket.on("error", (error) => {
      console.error("Chatbot: Socket error:", error);
      setMessages((prev) => [
        ...prev,
        { 
          id: Date.now(), 
          text: `Error: ${error}`, 
          sender: "system",
          username: "System"
        },
      ]);
    });

    // Request notification permission
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      socket.off("active-users");
      socket.off("system-message");
      socket.off("user-message");
      socket.off("message-sent");
      socket.off("user-typing");
      socket.off("user-disconnected");
      socket.off("new-message-notification");
      socket.off("chat-deleted");
      socket.off("error");
    };
  }, [user, socket, socketConnected]); // Removed currentUserId from dependencies to prevent unnecessary re-renders

  // Handle sending messages
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && user && socketConnected) {
      console.log("Chatbot: Sending guide message:", newMessage);
      
      const guideMessage = { 
        id: Date.now(), 
        text: newMessage, 
        sender: "guide",
        username: user.name,
        timestamp: new Date()
      };
      
      // Add to current messages if user is selected
      if (currentUserId) {
        setMessages((prevMessages) => [...prevMessages, guideMessage]);
        
        // Also add to all messages storage
        setAllMessages(prev => ({
          ...prev,
          [currentUserId]: [...(prev[currentUserId] || []), guideMessage]
        }));
      }
      
      // Send message based on target selection
      if (messageTarget === "all") {
        // Broadcast to all users
        socket.emit("agent-message", { 
          targetUserId: "all",
          message: newMessage,
          guideUsername: user.name,
          broadcastToAll: true
        });
      } else {
        // Send to specific user
        if (currentUserId) {
          socket.emit("agent-message", { 
            targetUserId: currentUserId, 
            message: newMessage,
            guideUsername: user.name,
            broadcastToAll: false
          });
        }
      }
      
      setNewMessage(""); // Clear the input field
      inputRef.current?.focus();
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (currentUserId && user && socketConnected) {
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

  const handleUserSelect = (selectedUserId) => {
    setCurrentUserId(selectedUserId);
    // Load messages for selected user
    setMessages(allMessages[selectedUserId] || []);
    setIsTyping(false);
    // Clear unread count for selected user
    setUnreadCounts(prev => ({
      ...prev,
      [selectedUserId]: 0
    }));
  };

  const handleDeleteChat = () => {
    if (currentUserId && user) {
      if (window.confirm(`Are you sure you want to delete the chat with ${users.find(u => u.userId === currentUserId)?.username}? This action cannot be undone.`)) {
        socket.emit("delete-chat", {
          targetUserId: currentUserId
        });
      }
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const filteredUsers = users.filter(user => 
    !deletedChats.includes(user.userId) && (
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userId.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Get all recent messages from all users for overview
  const getAllRecentMessages = () => {
    const allMessagesArray = [];
    Object.entries(allMessages).forEach(([userId, userMessages]) => {
      const user = users.find(u => u.userId === userId);
      if (user) {
        userMessages.forEach(message => {
          allMessagesArray.push({
            ...message,
            displayUsername: `${user.username} (${message.username})`
          });
        });
      }
    });
    return allMessagesArray.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  const recentMessages = getAllRecentMessages();

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50">
        <MessageSquare className="h-16 w-16 text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">Please log in to access the chat system</p>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-white rounded-lg shadow-lg overflow-hidden">
      {/* User List Sidebar */}
      <div className={`w-80 bg-gray-50 border-r border-gray-200 flex flex-col ${showUserList ? 'block' : 'hidden lg:block'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-lg">Active Users</h2>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-indigo-100 text-sm">
                {socketConnected ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          
          {/* Search */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? 'No users found' : 'No users currently online'}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.userId}
                onClick={() => handleUserSelect(user.userId)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors duration-200 ${
                  currentUserId === user.userId ? 'bg-indigo-50 border-indigo-200' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{user.username}</h3>
                      <p className="text-sm text-gray-500">{user.userId}</p>
                    </div>
                  </div>
                  {unreadCounts[user.userId] > 0 && (
                    <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {unreadCounts[user.userId]}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentUserId ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {users.find(u => u.userId === currentUserId)?.username || 'User'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isTyping ? 'typing...' : 'online'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDeleteChat}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  title="Delete chat"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowUserList(!showUserList)}
                  className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
                >
                  <Users className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-start" : "justify-end"}`}>
                  {message.sender === "user" && (
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-indigo-600" />
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.sender === "guide" 
                        ? "bg-indigo-600 text-white rounded-br-md" 
                        : message.sender === "system"
                        ? "bg-yellow-100 text-yellow-800 rounded-lg"
                        : "bg-white text-gray-800 rounded-bl-md shadow-sm"
                    }`}>
                      <p className="text-sm">{message.text}</p>
                    </div>
                    <div className={`flex items-center space-x-1 mt-1 ${
                      message.sender === "guide" ? "justify-end" : "justify-start"
                    }`}>
                      <span className="text-xs text-gray-500">
                        {formatTime(message.timestamp)}
                      </span>
                      {message.sender === "guide" && (
                        <div className="flex items-center">
                          <CheckCheck className="h-3 w-3 text-indigo-500" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
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
              {/* Message Target Selection */}
              <div className="mb-3 flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="specific"
                    checked={messageTarget === "specific"}
                    onChange={(e) => setMessageTarget(e.target.value)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <UserCheck className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Send to selected user</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="all"
                    checked={messageTarget === "all"}
                    onChange={(e) => setMessageTarget(e.target.value)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <Globe className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Broadcast to all users</span>
                </label>
              </div>

              <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    value={newMessage}
                    onChange={handleTyping}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    placeholder={messageTarget === "all" ? "Type a broadcast message..." : "Type your response..."}
                    rows="1"
                    disabled={!socketConnected || (messageTarget === "specific" && !currentUserId)}
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!socketConnected || !newMessage.trim() || (messageTarget === "specific" && !currentUserId)}
                  className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Overview Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Messages Overview</h3>
              <p className="text-sm text-gray-500">Select a user from the left to start chatting</p>
            </div>

            {/* Recent Messages */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
              {Object.keys(allMessages).length === 0 ? (
                <div className="text-center text-gray-500">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>No messages yet. Users will appear here when they send messages.</p>
                </div>
              ) : (
                Object.entries(allMessages).map(([userId, userMessages]) => {
                  const user = users.find(u => u.userId === userId);
                  if (!user) return null;
                  
                  return (
                    <div key={userId} className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-indigo-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{user.username}</h4>
                            <p className="text-xs text-gray-500">{userId}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUserSelect(userId)}
                          className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 transition-colors"
                        >
                          Chat
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        {userMessages.slice(-3).map((message) => (
                          <div key={message.id} className="flex justify-start">
                            <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg max-w-xs">
                              <p className="text-sm">{message.text}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {userMessages.length > 3 && (
                        <p className="text-xs text-gray-500 mt-2">
                          +{userMessages.length - 3} more messages
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Broadcast Input Area */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="mb-3 flex items-center space-x-2">
                <Globe className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">Broadcast message to all users</span>
              </div>
              
              <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    value={newMessage}
                    onChange={handleTyping}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    placeholder="Type a broadcast message to all users..."
                    rows="1"
                    disabled={!socketConnected}
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!socketConnected || !newMessage.trim()}
                  className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
