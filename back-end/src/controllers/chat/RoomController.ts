import type { Request, Response } from 'express';
import { RoomService } from '../../services/chat/RoomService.js';
import type { CreateDirectRoomDto, CreateGroupRoomDto } from '../../dtos/chat.dto.js';

export class RoomController {
  static async getUserRooms(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const rooms = await RoomService.getUserRooms(userId);
      res.status(200).json(rooms);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }

  static async getUserDirectRooms(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const rooms = await RoomService.getUserRooms(userId, 'DIRECT');
      res.status(200).json(rooms);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }

  static async getUserGroupRooms(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const rooms = await RoomService.getUserRooms(userId, 'GROUP');
      res.status(200).json(rooms);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }

  static async createDirectRoom(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const dto: CreateDirectRoomDto = req.body;
      const room = await RoomService.getOrCreateDirectRoom(userId, dto.targetUserId);
      res.status(201).json(room);
    } catch (error: any) {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  }

  static async createGroupRoom(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const dto: CreateGroupRoomDto = req.body;
      const room = await RoomService.createGroupRoom(userId, dto);
      res.status(201).json(room);
    } catch (error: any) {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  }

  static async createPublicRoom(req: Request, res: Response): Promise<void> {
    
  }

  static async getPublicRooms(_req: Request, res: Response): Promise<void> {
    try {
      const rooms = await RoomService.getPublicRooms();
      res.status(200).json(rooms);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }
}
