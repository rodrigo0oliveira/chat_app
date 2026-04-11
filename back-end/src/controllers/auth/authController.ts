import type { Request, Response } from 'express';
import { loginUser, registerUser } from '../../services/auth/auth.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body as {
      username?: string;
      email?: string;
      password?: string;
    };

    if (!username || !email || !password) {
      res.status(400).json({ message: 'username, email e password são obrigatórios' });
      return;
    }

    const result = await registerUser({ username, email, password });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Erro ao registrar usuário' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      res.status(400).json({ message: 'email e senha são obrigatórios' });
      return;
    }

    const result = await loginUser({ email, password });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Erro ao fazer login' });
  }
};
