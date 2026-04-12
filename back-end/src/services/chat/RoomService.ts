import mongoose from 'mongoose';
import Room from '../../models/Room.js';
import RoomMember from '../../models/RoomMember.js';
import User from '../../models/User.js';
import type { CreateGroupRoomDto, RoomResponseDto } from '../../dtos/chat.dto.js';

export class RoomService {

  static async getOrCreateDirectRoom(userId: string, targetUserId: string): Promise<RoomResponseDto> {
    if (userId === targetUserId) {
      throw new Error('Cannot create a direct room with yourself.');
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      throw new Error('Target user not found.');
    }

    const sortedIds = [userId, targetUserId].sort();
    const directChatId = `${sortedIds[0]}_${sortedIds[1]}`;

    let room = await Room.findOne({ directChatId });

    if (!room) {
      try {
        room = await Room.create({
          type: 'DIRECT',
          directChatId,
          name: null
        });

        await RoomMember.insertMany([
          { roomId: room._id, userId: userId, role: 'MEMBER' },
          { roomId: room._id, userId: targetUserId, role: 'MEMBER' }
        ]);
      } catch (error: any) {
        if (error.code === 11000) {
          room = await Room.findOne({ directChatId });
        } else {
          throw error;
        }
      }
    }

    if (!room) {
      throw new Error('Failed to get or create direct room');
    }

    return RoomService.getRoomDetails(room._id.toString());
  }

  static async createGroupRoom(userId: string, dto: CreateGroupRoomDto): Promise<RoomResponseDto> {
    const room = await Room.create({
      type: 'GROUP',
      name: dto.name,
      createdBy: userId,
    });

    const members = [
      { roomId: room._id, userId: userId, role: 'ADMIN' },
      ...dto.memberIds.map(memId => ({ roomId: room._id, userId: memId, role: 'MEMBER' }))
    ];

    const uniqueMembers = Array.from(new Map(members.map(m => [m.userId.toString(), m])).values());

    await RoomMember.insertMany(uniqueMembers);

    return RoomService.getRoomDetails(room._id.toString());
  }

  static async getRoomDetails(roomId: string): Promise<RoomResponseDto> {
    const room = await Room.findById(roomId).lean();
    if (!room) {
      throw new Error('Room not found');
    }

    const members = await RoomMember.find({ roomId }).populate('userId', 'username').lean();

    return {
      id: room._id.toString(),
      name: room.name,
      type: room.type,
      createdBy: room.createdBy ? room.createdBy.toString() : "",
      createdAt: room.createdAt,
      members: members.map((m: any) => ({
        userId: m.userId._id.toString(),
        username: m.userId.username,
        role: m.role as 'ADMIN' | 'MEMBER',
      })),
    };
  }

  static async getUserRooms(userId: string, type?: 'DIRECT' | 'GROUP'): Promise<RoomResponseDto[]> {
    const members = await RoomMember.find({ userId }).lean();
    const roomIds = members.map(m => m.roomId);

    const query: any = { _id: { $in: roomIds } };
    if (type) {
      query.type = type;
    }

    const rooms = await Room.find(query).sort({ createdAt: -1 }).lean();

    const responseRooms: RoomResponseDto[] = [];
    for (const room of rooms) {
      responseRooms.push(await RoomService.getRoomDetails(room._id.toString()));
    }

    return responseRooms;
  }

  static async getPublicRooms(): Promise<RoomResponseDto[]> {
    var rooms = await Room.find({ type: 'PUBLIC' });

    return rooms.map(room => ({
      id: room._id.toString(),
      name: room.name,
      type: room.type,
      createdBy: room.createdBy ? room.createdBy.toString() : "",
      createdAt: room.createdAt,
      members: []
    }))
  }
}
