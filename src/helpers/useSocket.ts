/* eslint-disable no-console */
import colors from 'colors';
import http from 'http';
import { Server } from 'socket.io';
import { logger } from '../shared/logger';
import config from '../config';
import { jwtHelper } from './jwtHelper';
import User from '../app/modules/user/User.model';
import chatSocket from '../app/modules/chat/Chat.socket';

export let io: Server | null;

const useSocket = (server: http.Server) => {
  io = new Server(server, { cors: { origin: '*' } });
  console.log(colors.green('Socket server initialized'));

  io.on('connection', async socket => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        console.log(colors.yellow(`No token, disconnecting: ${socket.id}`));
        socket.disconnect();
        return;
      }

      // Authenticate user
      const { email } = jwtHelper.verifyToken(
        token,
        config.jwt.jwt_secret as string,
      );

      const user = await User.findOne({ email });

      if (!user) {
        console.log(colors.red(`User not found, disconnecting: ${socket.id}`));
        socket.disconnect();
        return;
      }

      console.log(colors.blue(`User connected: ${user.email} (${socket.id})`));

      // Attach email to socket data for easy access
      socket.data.user = user;

      // Attach chat socket events
      chatSocket(socket, io!);

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(
          colors.red(`User disconnected: ${user.email} (${socket.id})`),
        );
      });
    } catch (error) {
      console.log(colors.red('Authentication error:'), colors.red('' + error));
      socket.emit('tokenExpired');
      socket.disconnect();
    }
  });
};

export default useSocket;
