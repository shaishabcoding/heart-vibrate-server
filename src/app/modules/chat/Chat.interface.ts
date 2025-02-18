import { Document, Types } from 'mongoose';

export interface IChat extends Document {
  name?: string;
  image?: string;
  users: Types.ObjectId[];
  isGroup: boolean;
  admins: Types.ObjectId[];
  lastMessage: string;
  lastMessageTime: Date;
}
