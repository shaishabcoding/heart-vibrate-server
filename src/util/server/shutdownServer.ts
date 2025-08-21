import colors from 'colors';
import { Server } from 'http';
import { errorLogger, logger } from '../logger/logger';
import config from '../../config';

/**
 * Shuts down the server
 *
 * This function shuts down the server gracefully when a signal is received.
 * It logs a message indicating that the server is shutting down and closes the server.
 */
export default async function shutdownServer(
  server: Server,
  signal: string,
  err?: Error,
) {
  if (err) errorLogger.error(colors.red(`${signal} occurred: `), err);

  if (signal === 'uncaughtException' && !config.server.isDevelopment) return;

  logger.info(colors.magenta(`🔴 Shutting down server due to ${signal}...`));

  server.close(shutdownErr => {
    if (shutdownErr) {
      errorLogger.error(
        colors.red('❌ Error during server shutdown'),
        shutdownErr,
      );
      process.exit(1);
    }

    logger.info(colors.magenta('✅ Server closed.'));
    process.exit(0);
  });
}
