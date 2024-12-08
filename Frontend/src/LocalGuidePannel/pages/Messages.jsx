import React from 'react';
import Chatbot from '../components/Chatbot'; // Make sure to adjust the path if necessary

const Messages = () => {
  return (
    <div className="p-6 bg-gray-200 h-full">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Chat with Users</h1>
      <Chatbot />
    </div>
  );
};

export default Messages;
