/* eslint-disable no-unused-vars */
import { DefaultEventsMap, Server, Socket } from 'socket.io';

export type TSocketHandler = (
  io: Server,
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
) => void;
