import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
      res.status(401).json({ message: 'Token de acesso requerido' });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET não configurado');
      res.status(500).json({ message: 'Erro interno do servidor' });
      return;
    }

    const decoded = jwt.verify(token, secret) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401).json({ message: 'Token inválido' });
      return;
    }

    req.userId = decoded.id;
    req.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Token inválido' });
      return;
    }
    console.error('Erro no middleware de autenticação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};