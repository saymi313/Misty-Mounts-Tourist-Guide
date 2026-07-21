import React, { createContext, useContext, useState, useEffect } from 'react';
import { socket } from '../data/mockSocket';
import { mockUser } from '../data/mockData';

// ─────────────────────────────────────────────────────────────────────────────
// AuthContext — BACKEND DISCONNECTED (dummy-data phase).
//
// The real Express auth + Socket.io server are not running. To let every screen
// render, we auto-login a mock user and expose a mock socket. `login`/`logout`
// operate purely on local state. Re-point the marked lines at the real API to
// restore backend connectivity later.
// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext();

// Mock socket instance (simulates a local guide). Was: io('http://localhost:5000')
export { socket };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);

  // Track the mock socket's connection state for chat UI.
  useEffect(() => {
    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  // Auto-login on app start so all screens are viewable without a backend.
  useEffect(() => {
    const stored = localStorage.getItem('user');
    let activeUser = mockUser;
    if (stored) {
      try {
        activeUser = JSON.parse(stored);
      } catch {
        activeUser = mockUser;
      }
    } else {
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'mock-token');
    }
    setUser(activeUser);
    if (!socket.connected) socket.connect();
    setLoading(false);
  }, []);

  // Local-only login — accepts any credentials and signs in a mock user.
  const login = async (email /*, password */) => {
    const userData = {
      email: email || mockUser.email,
      name: mockUser.name,
      type: 'user',
    };
    setUser(userData);
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify(userData));
    if (!socket.connected) socket.connect();
    return { success: true, user: userData };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (socket.connected) socket.disconnect();
  };

  const value = { user, login, logout, loading, socket, socketConnected };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
