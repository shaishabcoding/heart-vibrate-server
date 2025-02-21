import { Types } from 'mongoose';

export interface IMessage extends Document {
  chat: Types.ObjectId;
  content: string;
  type: string;
  sender: Types.ObjectId;
  readBy: Types.ObjectId[];
  likedBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
