import React, { useState, useEffect } from "react";
import { Send, MessageSquare, User } from "lucide-react";
import { io } from "socket.io-client";

// Initialize the socket connection
const socket = io("http://localhost:5000", {
  transports: ["websocket"], // Use WebSocket transport
});

const ChatBox = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello, traveler! How can I assist you with your tourist spot experience today?",
      sender: "agent",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // Listen for agent messages from the server
    socket.on("agent-message", (message) => {
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, text: message, sender: "agent" },
      ]);
    });

    // Cleanup the socket listener when the component unmounts
    return () => {
      socket.off("agent-message");
    };
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      // Send user message to the server
      socket.emit("user-message", newMessage);
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, text: newMessage, sender: "user" },
      ]);
      setNewMessage("");
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <MessageSquare className="h-8 w-8 text-blue-800" />
        <h2 className="text-2xl font-bold text-blue-800">
          Chat with a Travel Guide
        </h2>
      </div>
      <div
        className="flex-grow overflow-y-auto mb-4 space-y-4 pr-2"
        style={{ maxHeight: "400px" }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.sender === "agent" && (
              <div className="flex-shrink-0 mr-3">
                <User className="h-10 w-10 text-blue-800 bg-blue-100 rounded-full p-2" />
              </div>
            )}
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                message.sender === "user"
                  ? "bg-blue-800 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow px-3 py-2 border border-blue-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white bg-opacity-50"
          placeholder="Ask about attractions, local tips, or facilities..."
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-800 text-white rounded-r-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition duration-300"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
