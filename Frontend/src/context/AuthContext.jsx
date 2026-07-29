import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { socket as mockSocket } from '../data/mockSocket';
import api, { LIVE, SOCKET_URL } from '../data/api';
import { hydrateSaved } from '../utils/savedStore';
import { fetchNotifications } from '../utils/notificationsStore';

// Pull per-user lists into their caches so the bell badge, saved hearts, etc.
// are correct app-wide once a live session is active.
const hydrateUserData = () => {
  if (!LIVE) return;
  hydrateSaved();
  fetchNotifications();
};

// ─────────────────────────────────────────────────────────────────────────────
// AuthContext — talks to the real backend when VITE_API_URL is set (LIVE), and
// falls back to the dummy-data layer (auto-login + mock socket) otherwise.
// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext();

// Real Socket.io client when live; the simulated one otherwise.
const socket = LIVE
  ? io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    })
  : mockSocket;

export { socket };

// Attach the JWT to the socket handshake (LIVE only) and connect. The server
// authenticates every socket with this token, so it must be set before connect.
const connectSocket = (token) => {
  if (LIVE) socket.auth = { token: token || localStorage.getItem('token') };
  if (!socket.connected) socket.connect();
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);

  // Track socket connection state for chat UI.
  useEffect(() => {
    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  // Session bootstrap.
  useEffect(() => {
    if (LIVE) {
      // Restore a session from localStorage; require a real login otherwise.
      const token = localStorage.getItem('token');
      const stored = localStorage.getItem('user');
      if (token && stored) {
        try {
          setUser(JSON.parse(stored));
          connectSocket(token);
          hydrateUserData();
        } catch {
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
      return;
    }

    // No backend configured: restore any stored session, otherwise stay logged out.
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
        connectSocket();
      } catch {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    if (LIVE) {
      try {
        const { data } = await api.post('/user/auth/login', { email, password });
        const userData = { email: data.email, name: data.name, type: data.type, avatar: data.avatar || '' };
        setUser(userData);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        connectSocket(data.token);
        hydrateUserData();
        return { success: true, user: userData };
      } catch (err) {
        const d = err.response?.data;
        if (d?.needsVerification) return { success: false, needsVerification: true, email: d.email };
        return { success: false, error: d?.message || 'Login failed' };
      }
    }

    // No backend configured — accept any credentials with a generic profile.
    const userData = { email: email || 'guest@mistymounts.pk', name: (email || 'traveller').split('@')[0], type: 'user' };
    setUser(userData);
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify(userData));
    connectSocket('mock-token');
    return { success: true, user: userData };
  };

  // Apply a session from an auth response (used after OTP verification).
  const applySession = (data) => {
    const userData = { email: data.email, name: data.name, type: data.type, avatar: data.avatar || '' };
    setUser(userData);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userData));
    connectSocket(data.token);
    hydrateUserData();
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (socket.connected) socket.disconnect();
  };

  // Merge a partial update into the current user, persist, and sync to the API when live.
  const updateUser = (patch) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...patch };
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
    if (LIVE) api.put('/user/me', patch).catch(() => {});
  };

  const value = { user, login, logout, updateUser, applySession, loading, socket, socketConnected };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
