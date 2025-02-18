import { model, Schema } from 'mongoose';
import { IChat } from './Chat.interface';

const chatSchema = new Schema<IChat>(
  {
    name: {
      type: String,
    },
    image: {
      type: String,
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    isGroup: {
      type: Boolean,
      default: false,
    },
    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: String,
    },
    lastMessageTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const Chat = model<IChat>('Chat', chatSchema);

export default Chat;
