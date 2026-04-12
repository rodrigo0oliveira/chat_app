import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  name: string;
  type: 'DIRECT' | 'GROUP' | 'PUBLIC';
  directChatId?: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    name: {
      type: String,
      required: function (this: IRoom) {
        return this.type === 'GROUP';
      },
      trim: true,
      default: null,
    },
    type: {
      type: String,
      enum: ['DIRECT', 'GROUP', 'PUBLIC'],
      required: true,
    },
    directChatId: {
      type: String,
      sparse: true,
      unique: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: function (this: IRoom) {
        return this.type === 'GROUP';
      },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

RoomSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'roomId',
});

const Room = mongoose.model<IRoom>('Room', RoomSchema);

export default Room;
