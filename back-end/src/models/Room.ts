import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  name: string;
  type: 'DIRECT' | 'GROUP';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['DIRECT', 'GROUP'],
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property to represent relationships: Room -> possui vários Messages
RoomSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'roomId',
});

const Room = mongoose.model<IRoom>('Room', RoomSchema);

export default Room;
