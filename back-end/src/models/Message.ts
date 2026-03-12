import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  content: string;
  roomId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
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

const Message = mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
