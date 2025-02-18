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
        sender: senderId,
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

      // 📌 Determine Opposite User's Name for One-on-One Chats
      let chatName = chat.name || 'Group Chat'; // Default to group name if available
      let chatImage = chat.image || null; // Default to group image

      if (!chat.isGroup) {
        // Find the opposite user
        const oppositeUser = chat.users.find(
          user => user._id.toString() !== senderId.toString(),
        );
        if (oppositeUser) {
          chatName = `${oppositeUser.name.firstName} ${oppositeUser.name.lastName}`;
          chatImage = oppositeUser.avatar;
        }
      }

      // 📌 Format chat details for inbox update
      const formattedChat = {
        _id: chat._id,
        lastMessage: newMessage.message,
        lastMessageTime: newMessage.createdAt,
        name: chatName,
        image: chatImage,
      };

      // 📌 Notify each user in the inbox
      await Promise.all(
        (chat.users as unknown as TUser[]).map(({ email }) =>
          io.to(`inbox_${email}`).emit('inboxMessageReceived', formattedChat),
        ),
      );

      // 📌 Broadcast message to chat room
      io.to(roomId).emit('chatMessageReceived', {
        sender: {
          _id: senderId,
          name: socket.data.user.name,
          avatar: socket.data.user.avatar,
          email: socket.data.user.email,
        },
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
