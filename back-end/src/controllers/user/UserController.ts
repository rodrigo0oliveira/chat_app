import type { Request, Response } from 'express';
import User from '../../models/User.js';

export class UserController {
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await User.find({}, '_id username email').lean();
      res.status(200).json(users);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: 'Failed to retrieve users' });
    }
  }
}
