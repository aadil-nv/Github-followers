import mongoose, { Schema, Document } from 'mongoose';
import { IUserEntity, UserRole } from '../interfaces/user.interface';

export interface IUserDocument extends Omit<IUserEntity, 'id'>, Document {
  role: UserRole;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String as unknown as typeof String, 
      enum: Object.values(UserRole),
      default: UserRole.User
    }
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
