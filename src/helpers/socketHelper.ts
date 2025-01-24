/* eslint-disable no-console */
import colors from 'colors';
import { Server } from 'socket.io';
import { logger } from '../shared/logger';
const socket = (io: Server) => {
  console.log('socket is connected');
  io.on('connection', socket => {
    console.log('A user connected:', socket.id);

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(colors.red('A user disconnect'));
    });

    socket.on('message', message => {
      console.log('message:', message);
      io.emit('message', message);
    });

    socket.on('join room', room => {
      socket.join(room);
    });
  });
};

export const socketHelper = { socket };
