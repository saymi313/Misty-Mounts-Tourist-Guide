import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const TestAuth = () => {
  const { user, socket } = useAuth();
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const [activeUsers, setActiveUsers] = useState([]);
  const [testMessage, setTestMessage] = useState('');
  const [receivedMessages, setReceivedMessages] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log('Socket connected');
      setSocketStatus('connected');
    };

    const handleDisconnect = () => {
      console.log('Socket disconnected');
      setSocketStatus('disconnected');
    };

    const handleActiveUsers = (users) => {
      console.log('Active users received:', users);
      setActiveUsers(users);
    };

    const handleUserMessage = (message) => {
      console.log('User message received:', message);
      setReceivedMessages(prev => [...prev, { type: 'user', ...message }]);
    };

    const handleAgentMessage = (message) => {
      console.log('Agent message received:', message);
      setReceivedMessages(prev => [...prev, { type: 'agent', ...message }]);
    };

    const handleSystemMessage = (message) => {
      console.log('System message received:', message);
      setReceivedMessages(prev => [...prev, { type: 'system', ...message }]);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('active-users', handleActiveUsers);
    socket.on('user-message', handleUserMessage);
    socket.on('agent-message', handleAgentMessage);
    socket.on('system-message', handleSystemMessage);

    // Set initial status
    setSocketStatus(socket.connected ? 'connected' : 'disconnected');

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('active-users', handleActiveUsers);
      socket.off('user-message', handleUserMessage);
      socket.off('agent-message', handleAgentMessage);
      socket.off('system-message', handleSystemMessage);
    };
  }, [socket]);

  const handleJoinChat = () => {
    if (user && socket.connected) {
      console.log('Joining chat with:', user);
      socket.emit('join-chat', {
        userId: user.email,
        username: user.name,
        userType: user.type
      });
    }
  };

  const handleSendTestMessage = () => {
    if (testMessage.trim() && user && socket.connected) {
      if (user.type === 'user') {
        socket.emit('user-message', {
          message: testMessage,
          userId: user.email,
          username: user.name
        });
      } else if (user.type === 'local guide') {
        socket.emit('agent-message', {
          targetUserId: 'all',
          message: testMessage,
          guideUsername: user.name,
          broadcastToAll: true
        });
      }
      setTestMessage('');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">WebSocket Test Panel</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Status */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Connection Status</h3>
          <div className="space-y-2">
            <p><strong>User:</strong> {user ? `${user.name} (${user.email})` : 'Not logged in'}</p>
            <p><strong>User Type:</strong> {user?.type || 'N/A'}</p>
            <p><strong>Socket Status:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                socketStatus === 'connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {socketStatus}
              </span>
            </p>
            <button
              onClick={handleJoinChat}
              disabled={!user || !socket.connected}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Join Chat
            </button>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Active Users ({activeUsers.length})</h3>
          <div className="space-y-1">
            {activeUsers.map((user, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium">{user.username}</span>
                <span className="text-gray-500 ml-2">({user.userType})</span>
              </div>
            ))}
            {activeUsers.length === 0 && (
              <p className="text-gray-500 text-sm">No active users</p>
            )}
          </div>
        </div>
      </div>

      {/* Test Message */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Send Test Message</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Type a test message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded"
            onKeyPress={(e) => e.key === 'Enter' && handleSendTestMessage()}
          />
          <button
            onClick={handleSendTestMessage}
            disabled={!testMessage.trim() || !socket.connected}
            className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>

      {/* Received Messages */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Received Messages ({receivedMessages.length})</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {receivedMessages.map((message, index) => (
            <div key={index} className="text-sm p-2 bg-white rounded border">
              <div className="flex justify-between">
                <span className="font-medium">{message.type}</span>
                <span className="text-gray-500">{new Date().toLocaleTimeString()}</span>
              </div>
              <p className="text-gray-700">{message.text || message.message}</p>
              {message.username && <p className="text-gray-500">From: {message.username}</p>}
            </div>
          ))}
          {receivedMessages.length === 0 && (
            <p className="text-gray-500 text-sm">No messages received</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestAuth; 