import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const AuthContext = createContext();

// Create a shared socket instance with better configuration
export const socket = io('http://localhost:5000', {
  transports: ['websocket'],
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);

  // Socket connection management
  useEffect(() => {
    const handleConnect = () => {
      console.log('Socket connected successfully');
      setSocketConnected(true);
      
      // If user is logged in, join chat immediately
      if (user) {
        console.log('Joining chat after connection:', user);
        socket.emit('join-chat', {
          userId: user.email,
          username: user.name,
          userType: user.type
        });
      }
    };

    const handleDisconnect = (reason) => {
      console.log('Socket disconnected:', reason);
      setSocketConnected(false);
    };

    const handleConnectError = (error) => {
      console.error('Socket connection error:', error);
      setSocketConnected(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, [user]);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Connect socket when user is authenticated
        if (!socket.connected) {
          console.log('Connecting socket for authenticated user');
          socket.connect();
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    console.log('AuthContext: Login attempt for:', email);
    try {
      const response = await fetch('http://localhost:5000/api/user/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('AuthContext: Response status:', response.status);
      const data = await response.json();
      console.log('AuthContext: Response data:', data);

      if (response.ok) {
        const userData = {
          email: data.email,
          name: data.name,
          type: data.type,
        };
        
        console.log('AuthContext: Setting user data:', userData);
        setUser(userData);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Connect socket after successful login
        if (!socket.connected) {
          console.log('Connecting socket after login');
          socket.connect();
        } else {
          // If already connected, join chat
          console.log('Socket already connected, joining chat');
          socket.emit('join-chat', {
            userId: userData.email,
            username: userData.name,
            userType: userData.type
          });
        }
        
        console.log('AuthContext: Login successful, returning success');
        return { success: true, user: userData };
      } else {
        console.error('AuthContext: Login failed with status:', response.status, 'message:', data.message);
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Disconnect socket on logout
    if (socket.connected) {
      console.log('Disconnecting socket on logout');
      socket.disconnect();
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    socket,
    socketConnected,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 