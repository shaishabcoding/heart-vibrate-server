/* eslint-disable no-console */
import { DefaultEventsMap, Server, Socket } from 'socket.io';
import Chat from './Chat.model';
import { TUser } from '../user/User.interface';
import Message from '../message/Message.model';
import { Types } from 'mongoose';

const chatSocket = (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  io: Server,
) => {
  console.log(`Socket connected: ${socket.id}`);

  // User subscribes to inbox updates
  socket.on('subscribeToInbox', () => {
    const userEmail = socket.data.user.email;

    socket.join(`inbox_${userEmail}`);
    console.log(`User subscribed to inbox: inbox_${userEmail}`);
  });

  // User subscribes to a specific chat room
  socket.on('subscribeToChat', (room: string) => {
    socket.join(room);
    console.log(`User subscribed to chat: ${room}`);
  });

  // Handle sending a private message
  socket.on('sendMessage', async ({ message, roomId }) => {
    if (!message || !roomId) {
      console.log(`Invalid message payload from: ${socket.id}`);
      return;
    }

    const { email, name, avatar, _id } = socket.data.user as TUser;

    console.log(`New message from ${email} to room: ${roomId}`);

    try {
      // 📌 Find the chat room and populate users
      const chat = await Chat.findById(roomId).populate(
        'users',
        '_id name avatar email',
      );

      if (!chat) {
        console.log(`Chat room ${roomId} not found`);
        return;
      }

      // 📌 Create the message and save it
      const newMessage = await Message.create({
        chat: roomId,
        message,
        sender: _id,
      });

      // 📌 Update chat with last message and timestamp
      await Chat.updateOne(
        { _id: new Types.ObjectId(roomId as string) },
        {
          $set: {
            lastMessage:
              message.length > 20 ? `${message.slice(0, 20)}...` : message,
            lastMessageTime: newMessage.createdAt,
          },
        },
        { new: true },
      );

      // 📌 Notify each user in the inbox
      await Promise.all(
        (chat.users as unknown as TUser[]).map(({ email }) =>
          io.to(`inbox_${email}`).emit('inboxUpdated'),
        ),
      );

      // 📌 Broadcast message to chat room
      io.to(roomId).emit('chatMessageReceived', {
        sender: {
          _id,
          name,
          avatar,
          email,
        },
        message,
        _id: newMessage._id,
        date: newMessage.createdAt,
      });
    } catch (error: any) {
      console.error(`Error sending message: ${error.message || error}`);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
};

export default chatSocket;
