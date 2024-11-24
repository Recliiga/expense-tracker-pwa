import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth';
import groupRoutes from './routes/groups';
import expenseRoutes from './routes/expenses';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://recliiga.github.io'
      : 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://recliiga.github.io'
    : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Store io instance on app
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || '')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('expense_added', (data) => {
    socket.to(data.roomId).emit('expense_update', data);
  });

  socket.on('expense_updated', (data) => {
    socket.to(data.roomId).emit('expense_update', data);
  });

  socket.on('expense_deleted', (data) => {
    socket.to(data.roomId).emit('expense_delete', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
