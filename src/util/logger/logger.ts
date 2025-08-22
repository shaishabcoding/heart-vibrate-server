/* eslint-disable no-console */
import { createLogger, format, transports } from 'winston';
import 'winston-mongodb';
import config from '../../config';
import stripAnsi from 'strip-ansi';

const { combine, timestamp, label, printf } = format;

const customFormat = printf(
  ({ level, message, label, timestamp }) =>
    `${timestamp} [${label}] ${level}: ${message}`,
);

const removeColorsFormat = format(info => {
  info.message = stripAnsi(info.message as string);
  return info;
});

/**
 * Logger for success messages
 */
export const logger = createLogger({
  level: 'info',
  format: combine(
    label({ label: config.server.name }),
    timestamp(),
    customFormat,
  ),
  transports: [
    new transports.Console(),
    new transports.MongoDB({
      db: config.url.database,
      options: { useUnifiedTopology: true },
      collection: 'app_logs',
      tryReconnect: true,
      level: 'info',
      format: combine(removeColorsFormat()),
    }),
  ],
});

/**
 * Logger for error messages
 */
export const errorLogger = createLogger({
  level: 'error',
  format: combine(
    label({ label: config.server.name }),
    timestamp(),
    customFormat,
  ),
  transports: [
    new transports.Console(),
    new transports.MongoDB({
      db: config.url.database,
      options: { useUnifiedTopology: true },
      collection: 'error_logs',
      tryReconnect: true,
      level: 'error',
      format: combine(removeColorsFormat()),
    }),
  ],
});
