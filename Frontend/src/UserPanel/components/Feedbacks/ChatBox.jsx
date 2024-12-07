import React, { useState } from 'react';
import { Send, MessageSquare, User } from 'lucide-react';

const ChatBox = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello, traveler! How can I assist you with your tourist spot experience today?", sender: "agent" },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages([...messages, { id: messages.length + 1, text: newMessage, sender: "user" }]);
      setNewMessage("");
      // Simulate agent response
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { id: prevMessages.length + 1, text: "Thank you for sharing. Is there anything specific about the tourist spot or local attractions you'd like to know?", sender: "agent" },
        ]);
      }, 1000);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <MessageSquare className="h-8 w-8 text-emerald-600" />
        <h2 className="text-2xl font-bold text-emerald-800">Chat with a Travel Guide</h2>
      </div>
      <div className="flex-grow overflow-y-auto mb-4 space-y-4 pr-2" style={{maxHeight: '400px'}}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.sender === "agent" && (
              <div className="flex-shrink-0 mr-3">
                <User className="h-10 w-10 text-emerald-600 bg-emerald-100 rounded-full p-2" />
              </div>
            )}
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                message.sender === "user" ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-800"
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
          className="flex-grow px-3 py-2 border border-emerald-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white bg-opacity-50"
          placeholder="Ask about attractions, local tips, or facilities..."
        />
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 text-white rounded-r-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-300"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;

