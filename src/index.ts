import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/auth/index.js';
import userRoutes from './routes/user/index.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3000);
const mongoUri = process.env.MONGO_URI ?? process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

app.get('/test', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/user', userRoutes);

const startServer = async (): Promise<void> => {
  if (!mongoUri) {
    throw new Error('MONGO_URI (ou MONGODB_URI) não configurado');
  }

  await mongoose.connect(mongoUri);
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer().catch((error: unknown) => {
  console.error('Erro ao iniciar servidor:', error);
  process.exit(1);
});
