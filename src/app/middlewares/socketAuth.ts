/* eslint-disable no-unused-vars */
import { Socket } from 'socket.io';
import { decodeUser } from '../modules/auth/Auth.utils';
import { socketError } from '../modules/socket/Socket.utils';

const socketAuth = async (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake?.auth?.token ?? socket.handshake?.query?.token;

  try {
    const user = await decodeUser(token, 'access_token');

    Object.assign(socket.data, { user });

    next();
  } catch (error) {
    socketError(socket, error as Error);
    setTimeout(socket.disconnect, 100);
  }
};

export default socketAuth;
