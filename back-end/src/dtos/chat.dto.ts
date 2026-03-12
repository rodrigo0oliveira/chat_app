export interface CreateDirectRoomDto {
  targetUserId: string; // The user ID of the person to chat with
}

export interface CreateGroupRoomDto {
  name: string;
  memberIds: string[]; // List of user IDs to add initially
}

export type CreateRoomDto = CreateDirectRoomDto | CreateGroupRoomDto;

export interface CreateMessageDto {
  roomId: string;
  content: string;
}

export interface RoomResponseDto {
  id: string;
  name: string | null;
  type: 'DIRECT' | 'GROUP';
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
  content: string;
  createdAt: Date;
}
