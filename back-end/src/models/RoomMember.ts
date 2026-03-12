import mongoose, { Schema, Document } from 'mongoose';

export interface IRoomMember extends Document {
  userId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: Date;
}

const RoomMemberSchema = new Schema<IRoomMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'MEMBER'],
      default: 'MEMBER',
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'joinedAt', updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

RoomMemberSchema.index({ userId: 1 });
RoomMemberSchema.index({ roomId: 1 });
// Constraint única composta garantindo UNIQUE(userId, roomId)
RoomMemberSchema.index({ userId: 1, roomId: 1 }, { unique: true });

const RoomMember = mongoose.model<IRoomMember>('RoomMember', RoomMemberSchema);

export default RoomMember;
