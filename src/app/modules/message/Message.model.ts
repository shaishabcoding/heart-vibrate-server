import { model, Schema, Document } from 'mongoose';
import { IMessage } from './Message.interface';

const messageSchema = new Schema<IMessage & Document>(
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Message = model<IMessage>('Message', messageSchema);

export default Message;
