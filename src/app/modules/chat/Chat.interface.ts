import { Document, Types } from 'mongoose';

export interface IChat extends Document {
  name: string;
  users: Types.ObjectId[];
  isGroup: boolean;
  admins: Types.ObjectId[];
  lastMessage: Types.ObjectId;
}
