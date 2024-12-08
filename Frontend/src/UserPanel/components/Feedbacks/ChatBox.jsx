import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  transports: ["websocket"], // Use WebSocket transport
});

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // Listen for agent messages
    socket.on("agent-message", (message) => {
      setMessages((prev) => [...prev, { sender: "agent", text: message }]);
    });

    // Cleanup when the component is unmounted
    return () => {
      socket.off("agent-message");
    };
  }, []);

  const sendMessage = () => {
    if (newMessage.trim()) {
      // Send message to the backend
      socket.emit("user-message", newMessage);
      setMessages((prev) => [...prev, { sender: "user", text: newMessage }]);
      setNewMessage("");
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index} className={msg.sender === "user" ? "user" : "agent"}>
            {msg.text}
          </div>
        ))}
      </div>
      <input
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chatbot;
