/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { DefaultEventsMap, Server, Socket } from 'socket.io';
import Chat from './Chat.model';
import { TUser } from '../user/User.interface';
import Message from '../message/Message.model';
import saveChunkedFile from '../../../shared/saveChunkedFile';
import deleteFile from '../../../shared/deleteFile';

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
  socket.on(
    'sendMessage',
    async ({ content, type = 'text', roomId, chunkIndex, totalChunks }) => {
      if (!content || !roomId) {
        console.log(`❌ Invalid message payload from: ${socket.id}`);
        return;
      }

      const { email, name, avatar, _id } = socket.data.user as TUser;

      try {
        const chat = await Chat.findById(roomId).populate(
          'users',
          '_id name avatar email',
        );
        if (!chat) {
          console.log(`❌ Chat room ${roomId} not found`);
          return;
        }

        const filePath = content;

        if (type !== 'text') {
          // Pass a callback to handle file save completion
          const result = saveChunkedFile(
            content,
            roomId,
            type,
            chunkIndex,
            totalChunks,
            async response => {
              if (!response.success || !response.filePath) {
                console.error('❌ Error saving file:', response.error);
                return;
              }

              try {
                // Create message only after successful file save
                const newMessage = await Message.create({
                  chat: roomId,
                  content: response.filePath,
                  type,
                  sender: _id,
                });

                console.log(
                  `🔥 Message saved successfully: ${response.filePath}`,
                );

                // Notify inbox users
                await Promise.all(
                  (chat.users as unknown as TUser[]).map(({ email }) =>
                    io.to(`inbox_${email}`).emit('inboxUpdated'),
                  ),
                );

                // Broadcast the completed message
                io.to(roomId).emit('chatMessageReceived', {
                  sender: { _id, name, avatar, email },
                  content: response.filePath,
                  type,
                  _id: newMessage._id,
                  date: newMessage.createdAt,
                  chatId: roomId,
                });

                console.log(
                  `🚀 New message sent successfully to room ${roomId}`,
                );
              } catch (error) {
                console.error('❌ Error creating message:', error);
              }
            },
          );

          if (!result.success) {
            console.log(result.error);
            return;
          }

          // Return early, message creation will be handled in callback
          return;
        }

        // Handle text messages as before
        const newMessage = await Message.create({
          chat: roomId,
          content: filePath,
          type,
          sender: _id,
        });

        io.to(roomId).emit('chatMessageReceived', {
          sender: { _id, name, avatar, email },
          content: filePath,
          type,
          _id: newMessage._id,
          date: newMessage.createdAt,
          chatId: roomId,
        });

        console.log(`🚀 New text message sent successfully to room ${roomId}`);
      } catch (error: any) {
        console.error(`❌ Error sending message: ${error.message || error}`);
      }
    },
  );

  socket.on('deleteMessage', async ({ messageId, roomId }) => {
    if (!messageId || !roomId) {
      console.log(`❌ Invalid delete request from: ${socket.id}`);
      return;
    }

    try {
      const message = await Message.findById(messageId);
      const chat = await Chat.findById(roomId)
        .select('users')
        .populate('users', 'email');

      if (!message || !chat) {
        console.log(`❌ Message ${messageId} not found`);
        return;
      }

      const { _id: userId } = socket.data.user as TUser;

      // Check if the user is the sender
      if (message.sender.toString() !== userId!.toString()) {
        console.log(`❌ Unauthorized delete attempt by ${userId}`);
        return;
      }

      // If the message contains a file, delete it from storage
      if (message.type !== 'text' && message.content) {
        deleteFile(message.content);
      }

      // Delete the message from the database
      await Message.findByIdAndDelete(messageId);

      // Notify all users in the room
      io.to(roomId).emit('messageDeleted', { messageId, roomId });

      await Promise.all(
        (chat.users as unknown as TUser[]).map(({ email }) =>
          io.to(`inbox_${email}`).emit('inboxUpdated'),
        ),
      );

      console.log(`✅ Message ${messageId} deleted successfully`);
    } catch (error: any) {
      console.error(`❌ Error deleting message: ${error.message || error}`);
    }
  });

  socket.on('markAllMessagesAsRead', async ({ chatId }) => {
    if (!chatId) {
      console.log(`Invalid read receipt payload from: ${socket.id}`);
      return;
    }

    const { _id: userId } = socket.data.user as TUser;

    try {
      // 📌 Update all unread messages in the chat
      const result = await Message.updateMany(
        {
          chat: chatId,
          readBy: { $ne: userId }, // Only update messages the user hasn't read
        },
        {
          $addToSet: { readBy: userId }, // Add user to readBy array if not present
        },
      );

      if (!result.modifiedCount) return;

      console.log(
        `Marked ${result.modifiedCount} messages as read in chat: ${chatId}`,
      );

      io.to(`inbox_${socket.data.user.email}`).emit('inboxUpdated');
    } catch (error: any) {
      console.error(
        `Error marking messages as read: ${error.message || error}`,
      );
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
};

export default chatSocket;
