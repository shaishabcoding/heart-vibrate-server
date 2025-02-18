import { Types } from 'mongoose';

export interface IMessage extends Document {
  chat: Types.ObjectId;
  message: string;
  sender: Types.ObjectId;
  readBy: Types.ObjectId[];
  likedBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
