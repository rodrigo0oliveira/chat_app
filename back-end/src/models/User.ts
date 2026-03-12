import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username field is required!'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'E-mail é obrigatório!'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password é obrigatório!'],
      minLength: [8, 'A senha precisa ter 8 ou mais caracteres'],
      select: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
