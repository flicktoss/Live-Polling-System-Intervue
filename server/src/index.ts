import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { registerSocketHandlers } from './socket/handlers';
import { setupSocketHandlers } from './socket';
import type { ClientToServerEvents, ServerToClientEvents } from './types';
import pollRoutes from './routes/poll';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Handle multiple client URLs for deployment (comma-separated)
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = CLIENT_URL.split(',').map(url => url.trim());

const PORT = parseInt(process.env.PORT || '5000', 10);
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/live_polling';

// CORS configuration for REST API
app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use(pollRoutes);

// Socket.io with enhanced configuration
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all origins for Socket.io
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type'],
  },
  transports: ['websocket', 'polling'],
  pingInterval: 25000,
  pingTimeout: 20000,
  allowEIO3: true, // Enable compatibility with older clients
});

// Health check endpoint for deployment verification
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Legacy health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Register socket handlers
io.on('connection', (socket) => {
  registerSocketHandlers(io, socket);
});

// Setup existing socket handlers
setupSocketHandlers(io);

// Connect to MongoDB and start server
async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.warn('⚠️  MongoDB connection failed - running without persistence:', err);
    // Continue running even if MongoDB fails (for development)
  }

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Allowed origins: ${allowedOrigins.join(', ')}`);
  });
}

start();

export { io };
