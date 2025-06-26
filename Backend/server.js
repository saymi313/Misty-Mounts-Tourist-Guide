const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();

// Importing your routes
const authRoutes = require("./AdminBackend/routes/authRoutes");
const AdminRoutes = require("./AdminBackend/routes/adminRoutes");
const feedbackRoutes = require('./UserBackend/routes/feedbackRoutes');
const paymentRoutes = require('./UserBackend/routes/paymentRoutes');
const naturalDisasterRoutes = require("./LocalGuidePannel/routes/naturalDisasterRoutes");
const userAuthRoutes=require("./LocalGuidePannel/routes/authRoutes")

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // React frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = 5000;

// Enhanced active users storage with more information
let activeUsers = {}; // Store active users with their socket IDs and user info
let userSockets = {}; // Map user IDs to socket IDs for direct messaging
let messageHistory = {}; // Store message history per user
let unreadMessages = {}; // Track unread messages per user
let deletedChats = {}; // Track deleted chats per guide

// Middleware
app.use(cors({
  origin: "http://localhost:5173", // Allow frontend requests
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Allow PATCH method
  credentials: true,
}));

app.use(express.json()); // Parse incoming JSON data

// Routes
app.use("/api/admin/auth", authRoutes);
app.use("/api/user/auth", userAuthRoutes);
app.use("/api/admin", AdminRoutes); // Mount the spot routes
app.use('/api/feedback', feedbackRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/natural-disaster", naturalDisasterRoutes); // Natural disaster routes

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// Helper function to get or create conversation history
const getConversationHistory = (userId1, userId2) => {
  const conversationKey = [userId1, userId2].sort().join('_');
  if (!messageHistory[conversationKey]) {
    messageHistory[conversationKey] = [];
  }
  return messageHistory[conversationKey];
};

// Helper function to add message to history
const addMessageToHistory = (userId1, userId2, message) => {
  const conversationKey = [userId1, userId2].sort().join('_');
  if (!messageHistory[conversationKey]) {
    messageHistory[conversationKey] = [];
  }
  messageHistory[conversationKey].push(message);
  
  // Keep only last 100 messages per conversation
  if (messageHistory[conversationKey].length > 100) {
    messageHistory[conversationKey] = messageHistory[conversationKey].slice(-100);
  }
};

// Helper function to mark messages as read
const markMessagesAsRead = (userId, senderId) => {
  const conversationKey = [userId, senderId].sort().join('_');
  if (unreadMessages[conversationKey]) {
    unreadMessages[conversationKey] = 0;
  }
};

// Helper function to delete chat history
const deleteChatHistory = (guideId, userId) => {
  const conversationKey = [guideId, userId].sort().join('_');
  if (messageHistory[conversationKey]) {
    delete messageHistory[conversationKey];
  }
  if (unreadMessages[conversationKey]) {
    delete unreadMessages[conversationKey];
  }
  
  // Mark as deleted for the guide
  if (!deletedChats[guideId]) {
    deletedChats[guideId] = [];
  }
  deletedChats[guideId].push(userId);
};

// Helper function to check if chat is deleted for guide
const isChatDeleted = (guideId, userId) => {
  return deletedChats[guideId] && deletedChats[guideId].includes(userId);
};

// Helper function to emit active users to all clients
const emitActiveUsers = () => {
  const activeUsersList = Object.values(activeUsers).map(user => ({
    userId: user.userId,
    username: user.username,
    userType: user.userType
  }));
  
  console.log("Emitting active users:", activeUsersList);
  io.emit("active-users", activeUsersList);
};

// Enhanced Socket.IO Setup
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle user joining the chat with user information
  socket.on("join-chat", (userInfo) => {
    const { userId, username, userType } = userInfo;
    
    console.log(`User attempting to join:`, userInfo);
    
    // Store user information
    activeUsers[socket.id] = {
      userId,
      username,
      userType,
      socketId: socket.id,
      connectedAt: new Date()
    };
    
    // Map user ID to socket ID for direct messaging
    userSockets[userId] = socket.id;
    
    console.log(`User ${username} (${userType}) joined with ID: ${userId}`);
    console.log("Current active users:", Object.values(activeUsers));
    
    // Emit the updated active users list to all connected clients
    emitActiveUsers();
    
    // Send welcome message to the user
    if (userType === 'user') {
      socket.emit("system-message", {
        type: "welcome",
        message: `Welcome ${username}! A local guide will assist you shortly.`
      });
    } else if (userType === 'local guide') {
      socket.emit("system-message", {
        type: "welcome",
        message: `Welcome ${username}! You can now assist users with their queries.`
      });
    }
  });

  // Handle user messages with enhanced information
  socket.on("user-message", (messageData) => {
    const { message, userId, username } = messageData;
    let userInfo = activeUsers[socket.id];
    
    console.log("Received user message:", messageData);
    console.log("Current user info:", userInfo);
    
    // If user is not in active users, add them (this can happen if join-chat was missed)
    if (!userInfo) {
      userInfo = {
        userId,
        username,
        userType: 'user', // Assume user type if not specified
        socketId: socket.id,
        connectedAt: new Date()
      };
      activeUsers[socket.id] = userInfo;
      userSockets[userId] = socket.id;
      
      console.log(`User ${username} (${userId}) added to active users via message`);
      emitActiveUsers();
    }
    
    console.log(`Message from ${username} (${userId}):`, message);
    
    // Create message object with user information
    const messageObj = {
      id: Date.now(),
      text: message,
      sender: "user",
      userId: userId,
      username: username,
      timestamp: new Date(),
      isRead: false
    };
    
    // Add to message history
    addMessageToHistory(userId, 'guide', messageObj);
    
    // Broadcast the user message to all connected local guides
    io.emit("user-message", messageObj);
    
    // Also emit to the sender for confirmation
    socket.emit("message-sent", messageObj);
    
    // Send notification to guides
    const guides = Object.values(activeUsers).filter(u => u.userType === 'local guide');
    console.log("Sending notifications to guides:", guides);
    guides.forEach(guide => {
      if (guide.socketId !== socket.id) {
        io.to(guide.socketId).emit("new-message-notification", {
          from: username,
          message: message,
          userId: userId
        });
      }
    });
  });

  // Handle local guide responses with enhanced targeting
  socket.on("agent-message", (messageData) => {
    const { targetUserId, message, guideUsername, broadcastToAll } = messageData;
    const guideInfo = activeUsers[socket.id];
    
    console.log("Received agent message:", messageData);
    console.log("Guide info:", guideInfo);
    
    if (!guideInfo || guideInfo.userType !== 'local guide') {
      socket.emit("error", "Unauthorized: Only local guides can send agent messages");
      return;
    }
    
    console.log(`Guide ${guideUsername} responding to user ${targetUserId}:`, message);
    
    // Create message object with guide information
    const messageObj = {
      id: Date.now(),
      text: message,
      sender: "guide",
      guideUsername: guideUsername,
      targetUserId: targetUserId,
      timestamp: new Date(),
      isRead: false
    };
    
    if (broadcastToAll) {
      // Broadcast to all users (general announcement)
      console.log("Broadcasting message to all users");
      io.emit("agent-message", messageObj);
      
      // Add to message history for each user
      Object.values(activeUsers).forEach(user => {
        if (user.userType === 'user') {
          addMessageToHistory(user.userId, guideInfo.userId, messageObj);
        }
      });
      
      // Send notification to all users
      Object.values(activeUsers).forEach(user => {
        if (user.userType === 'user' && userSockets[user.userId]) {
          io.to(userSockets[user.userId]).emit("new-message-notification", {
            from: guideUsername,
            message: message,
            isFromGuide: true,
            isBroadcast: true
          });
        }
      });
    } else {
      // Send to specific user if targetUserId is provided
      if (targetUserId && userSockets[targetUserId]) {
        console.log(`Sending message to specific user: ${targetUserId}`);
        io.to(userSockets[targetUserId]).emit("agent-message", messageObj);
        
        // Add to message history
        addMessageToHistory(targetUserId, guideInfo.userId, messageObj);
        
        // Send notification to user
        io.to(userSockets[targetUserId]).emit("new-message-notification", {
          from: guideUsername,
          message: message,
          isFromGuide: true
        });
      } else {
        // Broadcast to all users if no specific target
        console.log("No specific target, broadcasting to all users");
        io.emit("agent-message", messageObj);
        
        // Add to message history for each user
        Object.values(activeUsers).forEach(user => {
          if (user.userType === 'user') {
            addMessageToHistory(user.userId, guideInfo.userId, messageObj);
          }
        });
      }
    }
    
    // Also emit to the guide for confirmation
    socket.emit("message-sent", messageObj);
  });

  // Handle chat deletion
  socket.on("delete-chat", (data) => {
    const { targetUserId } = data;
    const guideInfo = activeUsers[socket.id];
    
    if (!guideInfo || guideInfo.userType !== 'local guide') {
      socket.emit("error", "Unauthorized: Only local guides can delete chats");
      return;
    }
    
    console.log(`Guide ${guideInfo.username} deleting chat with user ${targetUserId}`);
    
    // Delete chat history
    deleteChatHistory(guideInfo.userId, targetUserId);
    
    // Notify the guide that chat was deleted
    socket.emit("chat-deleted", {
      targetUserId: targetUserId,
      message: "Chat history deleted successfully"
    });
    
    // Notify the user that the guide has cleared the chat
    if (userSockets[targetUserId]) {
      io.to(userSockets[targetUserId]).emit("system-message", {
        type: "chat-cleared",
        message: "The guide has cleared the chat history"
      });
    }
  });

  // Handle request for message history (filtered for deleted chats)
  socket.on("get-message-history", (data) => {
    const { userId, otherUserId } = data;
    const userInfo = activeUsers[socket.id];
    
    if (!userInfo) {
      socket.emit("error", "User not authenticated");
      return;
    }
    
    // For guides, check if chat is deleted
    if (userInfo.userType === 'local guide' && isChatDeleted(userInfo.userId, otherUserId)) {
      socket.emit("message-history", {
        userId: otherUserId,
        messages: [],
        isDeleted: true
      });
      return;
    }
    
    const history = getConversationHistory(userId, otherUserId);
    socket.emit("message-history", {
      userId: otherUserId,
      messages: history,
      isDeleted: false
    });
  });

  // Handle message read status
  socket.on("mark-as-read", (data) => {
    const { userId, senderId } = data;
    markMessagesAsRead(userId, senderId);
    
    // Notify sender that message was read
    if (userSockets[senderId]) {
      io.to(userSockets[senderId]).emit("message-read", {
        userId: userId,
        timestamp: new Date()
      });
    }
  });

  // Handle typing indicators
  socket.on("typing", (data) => {
    const { isTyping, userId, username } = data;
    socket.broadcast.emit("user-typing", { isTyping, userId, username });
  });

  // Handle disconnect event
  socket.on("disconnect", () => {
    const userInfo = activeUsers[socket.id];
    if (userInfo) {
      console.log(`User ${userInfo.username} (${userInfo.userId}) disconnected`);
      
      // Remove from active users
      delete activeUsers[socket.id];
      delete userSockets[userInfo.userId];
      
      // Emit the updated active users list
      emitActiveUsers();
      io.emit("user-disconnected", {
        userId: userInfo.userId,
        username: userInfo.username
      });
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
