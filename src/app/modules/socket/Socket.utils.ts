import { Socket } from 'socket.io';
import colors from 'colors';
import { errorLogger, logger } from '../../../util/logger/logger';

export const socketError = (socket: Socket, error: Error) => {
  socket.emit(
    'socketError',
    JSON.stringify({
      ...error,
      stack: undefined,
    }),
  );

  errorLogger.error(colors.red(error.message));
};

export const socketInfo = (message: string) => {
  logger.info(colors.green(message));
};
