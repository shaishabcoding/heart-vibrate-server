/* eslint-disable no-console */
import colors from 'colors';
import { Server } from 'socket.io';
import { logger } from '../shared/logger';
import config from '../config';
import { jwtHelper } from './jwtHelper';
import User from '../app/modules/user/User.model';

const userSocketMap = new Map(); // Stores email -> Set of socket IDs

const socket = (io: Server) => {
  console.log(colors.green('Socket server initialized'));

  io.on('connection', async socket => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        console.log(
          colors.yellow('No token provided, disconnecting socket:' + socket.id),
        );
        socket.disconnect();
        return;
      }

      const { email } = jwtHelper.verifyToken(
        token,
        config.jwt.jwt_secret as string,
      );
      const user = await User.findOne({ email });
      if (!user) {
        console.log(
          colors.red('User not found, disconnecting socket:' + socket.id),
        );
        socket.disconnect();
        return;
      }

      console.log(colors.blue(`User connected: ${user.email} (${socket.id})`));

      // Store user's socket and join personal room
      if (!userSocketMap.has(email)) {
        userSocketMap.set(email, new Set());
      }
      userSocketMap.get(email).add(socket.id);
      socket.join(email);

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(
          colors.red(`User disconnected: ${user.email} (${socket.id})`),
        );
        const userSockets = userSocketMap.get(email);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            userSocketMap.delete(email);
          }
        }
      });

      // Send a private message
      socket.on('private message', ({ recipientEmail, message }) => {
        if (userSocketMap.has(recipientEmail)) {
          io.to(recipientEmail).emit('private message', {
            senderEmail: user.email,
            message,
          });
          console.log(
            colors.green(
              `Private message from ${user.email} to ${recipientEmail}: ${message}`,
            ),
          );
        } else {
          console.log(
            colors.yellow(
              `Message delivery failed: ${recipientEmail} is offline.`,
            ),
          );
        }
      });

      // Broadcast message
      socket.on('message', message => {
        console.log(
          colors.cyan(`Broadcast message from ${user.email}: ${message}`),
        );
        io.emit('message', { senderEmail: user.email, message });
      });

      // Join a specific room
      socket.on('join room', room => {
        socket.join(room);
        console.log(colors.magenta(`${user.email} joined room: ${room}`));
      });
    } catch (error) {
      console.log(colors.red('Authentication error:'), colors.red('' + error));
      socket.disconnect();
    }
  });
};

export const socketHelper = { socket };
