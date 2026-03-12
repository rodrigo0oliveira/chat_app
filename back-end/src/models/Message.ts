import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  messageId: string;
  senderId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    messageId: {
      type: String,
      required: true,
      unique: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

MessageSchema.index({ roomId: 1, createdAt: 1 });

const Message = mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
