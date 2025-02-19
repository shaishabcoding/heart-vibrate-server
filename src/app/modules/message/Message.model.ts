import { model, Schema } from 'mongoose';
import { IMessage } from './Message.interface';

const messageSchema = new Schema<IMessage>(
  {
    chat: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: [],
        index: true,
      },
    ],
    likedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: [],
        index: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Message = model<IMessage>('Message', messageSchema);

export default Message;
