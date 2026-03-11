import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';

interface UserData {
  username: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

const encryptPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não configurado');
  }
  return jwt.sign({ id: userId }, secret, { expiresIn: '7d' });
};

export const registerUser = async (userData: UserData): Promise<string> => {
  const { username, email, password } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email já está cadastrado');
  }

  const hashedPassword = await encryptPassword(password);

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  });

  await newUser.save();

  return 'Usuário registrado com sucesso';
};

export const loginUser = async (loginData: LoginData): Promise<AuthResponse> => {
  const { email, password } = loginData;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('Email ou senha incorretos');
  }
  
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error('Email ou senha incorretos');
  }

  const token = generateToken(user._id.toString());

  return {
    message: 'Login realizado com sucesso',
    token,
    user: {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    },
  };
};