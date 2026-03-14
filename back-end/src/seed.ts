import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Room from './models/Room.js';

dotenv.config();

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('MONGO_URI não configurado');
  process.exit(1);
}

await mongoose.connect(mongoUri);

const existing = await Room.findOne({ type: 'PUBLIC', name: 'Chat Geral' });

if (existing) {
  console.log('Seed já aplicada — sala "Chat Geral" já existe:', existing._id.toString());
} else {
  const room = await Room.create({ type: 'PUBLIC', name: 'Chat Geral' });
  console.log('Seed executada com sucesso — sala "Chat Geral" criada com ID:', room._id.toString());
}
await mongoose.disconnect();
