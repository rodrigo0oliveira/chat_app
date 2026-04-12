export interface CreateDirectRoomDto {
  targetUserId: string;
}

export interface CreateGroupRoomDto {
  name: string;
  memberIds: string[];
}

export type CreateRoomDto = CreateDirectRoomDto | CreateGroupRoomDto;

export interface CreateMessageDto {
  roomId: string;
  content: string;
}

export interface RoomResponseDto {
  id: string;
  name: string | null;
  type: 'DIRECT' | 'GROUP' | 'PUBLIC';
  createdBy?: string;
  createdAt: Date;
  members: {
    userId: string;
    role: 'ADMIN' | 'MEMBER';
    username?: string;
  }[];
}

export interface MessageResponseDto {
  id: string;
  messageId: string;
  roomId: string;
  senderId: string;
  senderUsername: string;
  content: string;
  createdAt: Date;
}
