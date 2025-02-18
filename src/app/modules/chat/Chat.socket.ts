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

    const senderEmail = socket.data.user.email;
    const senderId = socket.data.user._id;

    console.log(`New message from ${senderEmail} to room: ${roomId}`);

    try {
      // 📌 Find the chat room and populate users
      const chat = await Chat.findById(roomId).populate(
        'users',
        'name avatar _id email',
      );

      if (!chat) {
        console.log(`Chat room ${roomId} not found`);
        return;
      }

      // const recipientEmails = (chat.users as unknown as TUser[]).map(
      //   user => user.email,
      // );

      // 📌 Create the message and save it
      const newMessage = await Message.create({
        chat: roomId,
        message,
        sender: senderId,
      });

      // 📌 Update chat with last message and timestamp
      await Chat.updateOne(
        { _id: new Types.ObjectId(roomId as string) },
        {
          $set: {
            lastMessage: message,
            lastMessageTime: newMessage.createdAt,
          },
        },
        {
          new: true,
        },
      );

      // 📌 Send notifications to inbox
      await Promise.all(
        (chat.users as unknown as TUser[]).map(({ email }) =>
          io.to(`inbox_${email}`).emit('inboxMessageReceived', newMessage),
        ),
      );

      // 📌 Broadcast message to chat room
      io.to(roomId).emit('chatMessageReceived', {
        sender: socket.data.user,
        message,
        _id: newMessage._id,
        date: newMessage.createdAt,
      });
    } catch (error) {
      console.error(`Error sending message: ${error.message || error}`);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
};

export default chatSocket;
