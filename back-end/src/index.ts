import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth/index.js';
import userRoutes from './routes/user/index.js';
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { StompHandler } from './websocket/StompHandler.js';
import roomRoutes from './routes/room.js';
import messageRoutes from './routes/message.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT ?? 3000);
const mongoUri = process.env.MONGO_URI ?? process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/test', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/rooms', roomRoutes);
app.use('/messages', messageRoutes);

const startServer = async (): Promise<void> => {
  if (!mongoUri) {
    throw new Error('MONGO_URI (ou MONGODB_URI) não configurado');
  }

  await mongoose.connect(mongoUri);
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  // Attach WebSocket server sharing the same underlying HTTP server
  const wss = new WebSocketServer({ server });
  
  wss.on('connection', (ws) => {
    const connectionId = uuidv4();
    console.log(`[WS] New connection established: ${connectionId}`);
    // Hand over control to StompHandler
    new StompHandler(ws, connectionId);
  });
};

startServer().catch((error: unknown) => {
  console.error('Erro ao iniciar servidor:', error);
  process.exit(1);
});
