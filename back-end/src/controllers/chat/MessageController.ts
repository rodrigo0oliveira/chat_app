import type { Request, Response } from 'express';
import { MessageService } from '../../services/chat/MessageService.js';
import RoomMember from '../../models/RoomMember.js';

export class MessageController {
  static async getRoomMessages(req: Request, res: Response): Promise<void> {
    try {
      const { roomId } = req.params;
      const { limit, before } = req.query;

      const numLimit = limit ? parseInt(limit as string, 10) : 50;
      const beforeStr = before as string | undefined;
      const beforeDate = beforeStr ? new Date(beforeStr) : undefined;

      const messages = await MessageService.getRoomMessages(roomId as string, numLimit, beforeDate);
      res.status(200).json(messages);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }
}
