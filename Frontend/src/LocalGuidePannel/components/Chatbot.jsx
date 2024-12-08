import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Send, User } from "lucide-react";

const socket = io("http://localhost:5000"); // Backend URL

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [users, setUsers] = useState([]); // Active users list
  const [newMessage, setNewMessage] = useState("");

  // Fetch active users (if applicable)
  useEffect(() => {
    socket.emit("join-chat", "guideId123"); // Local guide id, this can be dynamic based on the logged-in guide
    socket.on("active-users", (activeUsers) => {
      setUsers(activeUsers); // Update users list when a user connects or disconnects
    });

    return () => {
      socket.off("active-users"); // Cleanup the event listener
    };
  }, []);

  // Listen for incoming messages from users
  useEffect(() => {
    socket.on("user-message", ({ userId, message }) => {
      if (userId === currentUserId) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { id: prevMessages.length + 1, text: message, sender: "user" },
        ]);
      }
    });

    return () => {
      socket.off("user-message");
    };
  }, [currentUserId]);

  // Handle sending messages
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && currentUserId) {
      const guideMessage = { id: messages.length + 1, text: newMessage, sender: "guide" };
      setMessages((prevMessages) => [...prevMessages, guideMessage]);
      socket.emit("agent-message", { userId: currentUserId, message: newMessage }); // Send message to the selected user
      setNewMessage(""); // Clear the input field
    }
  };

  return (
    <div className="h-full flex flex-col p-4 bg-gray-100 rounded-lg shadow-md">
      {/* User Selector */}
      <div className="mb-4">
        <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-1">
          Select a User
        </label>
        <select
          id="user-select"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          value={currentUserId || ""}
          onChange={(e) => setCurrentUserId(e.target.value)}
        >
          <option value="" disabled>Select a user to chat with</option>
          {users.map((user) => (
            <option key={user} value={user}>
              {user} {/* Use user ID or name */}
            </option>
          ))}
        </select>
      </div>

      {/* Chat Messages */}
      <div className="flex-grow overflow-y-auto mb-4 space-y-4 pr-2" style={{ maxHeight: "400px" }}>
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "user" ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-xs px-4 py-2 rounded-lg ${message.sender === "guide" ? "bg-indigo-500 text-white" : "bg-gray-200 text-gray-800"}`}>
              {message.text}
            </div>
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSendMessage} className="flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow px-3 py-2 border border-indigo-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white bg-opacity-50"
          placeholder="Type your response here..."
          disabled={!currentUserId} // Disable input if no user is selected
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300"
          disabled={!currentUserId}
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
