import mongoose from 'mongoose';
import Message from '../../models/Message.js';
import type { CreateMessageDto, MessageResponseDto } from '../../dtos/chat.dto.js';
import { v4 as uuidv4 } from 'uuid';
import { inMemoryBroker } from '../../websocket/broker/InMemoryBroker.js';

export class MessageService {
  static async saveAndPublishMessage(
    senderId: string,
    dto: CreateMessageDto,
    clientMessageId?: string
  ): Promise<MessageResponseDto> {

    const messageId = clientMessageId || uuidv4();

    let message;
    try {
      message = await Message.create({
        messageId,
        content: dto.content,
        roomId: dto.roomId,
        senderId,
      });
    } catch (error: any) {
      if (error.code === 11000) {
        message = await Message.findOne({ messageId });
      } else {
        throw error;
      }
    }

    if (!message) {
      throw new Error('Failed to save message.');
    }

    await message.populate('senderId');
    const sender = message.senderId as any;

    const responseDto: MessageResponseDto = {
      id: message._id.toString(),
      messageId: message.messageId,
      roomId: message.roomId.toString(),
      senderId: sender._id.toString(),
      senderUsername: sender.username || '',
      content: message.content,
      createdAt: message.createdAt,
    };

    inMemoryBroker.publish(`/topic/rooms.${dto.roomId}`, JSON.stringify(responseDto));

    return responseDto;
  }

  static async getRoomMessages(roomId: string, limit: number = 50, beforeTimestamp?: Date): Promise<MessageResponseDto[]> {
    const query: any = { roomId };

    if (beforeTimestamp) {
      query.createdAt = { $lt: beforeTimestamp };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate<{ senderId: { _id: mongoose.Types.ObjectId; username: string } }>('senderId', 'username')
      .lean();

    return messages.reverse().map(m => ({
      id: m._id.toString(),
      messageId: m.messageId,
      roomId: m.roomId.toString(),
      senderId: m.senderId._id.toString(),
      senderUsername: m.senderId.username,
      content: m.content,
      createdAt: m.createdAt,
    }));
  }
}
