/* eslint-disable no-console */
import { DefaultEventsMap, Server, Socket } from 'socket.io';
import Chat from './Chat.model';
import { TUser } from '../user/User.interface';
import Message from '../message/Message.model';
import saveChunkedFile from '../../../shared/saveChunkedFile';

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
    async ({
      content,
      type = 'text',
      roomId,
      chunkIndex,
      totalChunks,
      isLastChunk,
    }) => {
      if (!content || !roomId) {
        console.log(`❌ Invalid message payload from: ${socket.id}`);
        return;
      }

      const { email, name, avatar, _id } = socket.data.user as TUser;

      console.log(
        `✅ Chunk ${chunkIndex + 1}/${totalChunks} received from ${email} to room: ${roomId}`,
      );

      try {
        const chat = await Chat.findById(roomId).populate(
          'users',
          '_id name avatar email',
        );
        if (!chat) {
          console.log(`❌ Chat room ${roomId} not found`);
          return;
        }

        let filePath = content;

        if (type !== 'text') {
          // 📌 Store video chunks and wait for complete file
          const result = saveChunkedFile(
            content,
            roomId,
            type,
            chunkIndex,
            totalChunks,
          );

          if (!result.success) {
            console.log(result.error);
            return;
          }

          if (!isLastChunk) {
            return; // Wait until the last chunk before creating the message
          }

          filePath = result.filePath;

          if (!filePath) {
            console.error(
              `❌ Error: File path is missing after saving. Message cannot be created.`,
            );
            return;
          }
        }

        // 🔥 **Ensure filePath exists before creating the message**
        console.log(`✅ File path received: ${filePath}`);

        // 📌 Create the message after file is fully received
        const newMessage = await Message.create({
          chat: roomId,
          content: filePath,
          type,
          sender: _id,
        });

        console.log(`🔥 Message saved successfully: ${filePath}`);

        // 📌 Notify inbox users
        await Promise.all(
          (chat.users as unknown as TUser[]).map(({ email }) =>
            io.to(`inbox_${email}`).emit('inboxUpdated'),
          ),
        );

        // 📌 Broadcast the completed message
        io.to(roomId).emit('chatMessageReceived', {
          sender: { _id, name, avatar, email },
          content: filePath,
          type,
          _id: newMessage._id,
          date: newMessage.createdAt,
          chatId: roomId,
        });

        console.log(`🚀 New message sent successfully to room ${roomId}`);
      } catch (error: any) {
        console.error(`❌ Error sending message: ${error.message || error}`);
      }
    },
  );

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
