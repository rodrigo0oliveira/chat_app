import Message from '../../models/Message.js';
import RoomMember from '../../models/RoomMember.js';
import type { CreateMessageDto, MessageResponseDto } from '../../dtos/chat.dto.js';
import { v4 as uuidv4 } from 'uuid';
import { inMemoryBroker } from '../../websocket/broker/InMemoryBroker.js';

export class MessageService {
  /**
   * Saves a message idempotently and publishes it to the broker.
   */
  static async saveAndPublishMessage(
    senderId: string, 
    dto: CreateMessageDto, 
    clientMessageId?: string
  ): Promise<MessageResponseDto> {
    
    // Ensure the sender is actually a member of the room
    const isMember = await RoomMember.findOne({ userId: senderId, roomId: dto.roomId });
    if (!isMember) {
      throw new Error('User is not a member of this room.');
    }

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
      // Handle idempotency (if a message with the same messageId was already processed)
      if (error.code === 11000) {
        message = await Message.findOne({ messageId });
      } else {
        throw error;
      }
    }

    if (!message) {
      throw new Error('Failed to save message.');
    }

    const responseDto: MessageResponseDto = {
      id: message._id.toString(),
      messageId: message.messageId,
      roomId: message.roomId.toString(),
      senderId: message.senderId.toString(),
      content: message.content,
      createdAt: message.createdAt,
    };

    // Publish to broker topic: /topic/rooms.{roomId}
    inMemoryBroker.publish(`/topic/rooms.${dto.roomId}`, JSON.stringify(responseDto));

    return responseDto;
  }

  /**
   * Fetches paginated history for a room.
   */
  static async getRoomMessages(roomId: string, limit: number = 50, beforeTimestamp?: Date): Promise<MessageResponseDto[]> {
    const query: any = { roomId };
    
    if (beforeTimestamp) {
      query.createdAt = { $lt: beforeTimestamp };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return messages.reverse().map(m => ({
      id: m._id.toString(),
      messageId: m.messageId,
      roomId: m.roomId.toString(),
      senderId: m.senderId.toString(),
      content: m.content,
      createdAt: m.createdAt,
    }));
  }
}
