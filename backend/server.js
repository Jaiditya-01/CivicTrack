require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/database');

const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const notificationRoutes = require('./routes/notifications');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store connected users
const connectedUsers = new Map();

// Socket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room for notifications
  socket.on('joinUserRoom', (userId) => {
    socket.join(`user_${userId}`);
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} joined their room`);
  });

  // Join admin room for admin notifications
  socket.on('joinAdminRoom', () => {
    socket.join('admin_room');
    console.log('Admin joined admin room');
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    // Remove user from connected users
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CivicTrack Backend is running',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
