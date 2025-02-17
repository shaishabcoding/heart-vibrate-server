/* eslint-disable no-console */
import { DefaultEventsMap, Server, Socket } from 'socket.io';

const chatSocket = (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  io: Server,
) => {
  console.log(`Socket connected: ${socket.id}`);

  // User subscribes to inbox updates
  socket.on('subscribeToInbox', () => {
    const userEmail = socket.data.email; // Email is already validated in authentication

    socket.join(`inbox_${userEmail}`);
    console.log(`User subscribed to inbox: inbox_${userEmail}`);
  });

  // User subscribes to a specific chat room
  socket.on('subscribeToChat', (room: string) => {
    socket.join(room);
    console.log(`User subscribed to chat: ${room}`);
  });

  // Handle sending a private message
  socket.on('sendMessage', async ({ recipientEmail, message, roomId }) => {
    if (!recipientEmail || !message || !roomId) {
      console.log(`Invalid message payload from: ${socket.id}`);
      return;
    }

    const senderEmail = socket.data.email; // Use socket.data for security
    const msgData = {
      senderEmail,
      recipientEmail,
      message,
      roomId,
      timestamp: new Date(),
    };

    console.log(`New message from ${msgData.senderEmail} to ${recipientEmail}`);

    try {
      // 📌 Notify recipient's inbox
      io.to(`inbox_${recipientEmail}`).emit('inboxMessageReceived', {
        roomId,
        senderEmail: msgData.senderEmail,
        message,
        timestamp: msgData.timestamp,
      });

      // 📌 Deliver message in the chat room
      io.to(roomId).emit('chatMessageReceived', msgData);
    } catch (error) {
      console.log(`Error sending message: ${error}`);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
};

export default chatSocket;
