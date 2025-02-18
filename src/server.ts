import colors from 'colors';
import mongoose from 'mongoose';
import http from 'http';
import app from './app';
import config from './config';
import { errorLogger, logger } from './shared/logger';
import seedAdmin from './DB';
import useSocket from './helpers/useSocket';

// Global reference for the server
let server: http.Server | null = null;

// ✅ Handle uncaught exceptions
process.on('uncaughtException', error => {
  errorLogger.error(colors.red('💥 Uncaught Exception:'), error);
  process.exit(1);
});

// ✅ Start the server
async function startServer(): Promise<void> {
  try {
    // ✅ Connect to the database
    await mongoose.connect(config.database_url as string);
    await seedAdmin();
    logger.info(colors.green('🚀 Database connected successfully'));

    // ✅ Start the HTTP server
    server = http.createServer(app);
    const port = Number(config.port) || 3000;
    server.listen(port, config.ip_address as string, () => {
      logger.info(colors.yellow(`♻️  Server running on port: ${port}`));
    });

    // ✅ Initialize WebSocket
    useSocket(server);
  } catch (error) {
    errorLogger.error(colors.red('❌ Database connection failed!'), error);
    process.exit(1);
  }

  // ✅ Handle unhandled promise rejections
  process.on('unhandledRejection', error => {
    logger.error(colors.red('🚨 Unhandled Rejection:'), error);
    if (server) server.close(() => process.exit(1));
    else process.exit(1);
  });
}

// ✅ Graceful shutdown on SIGTERM
process.on('SIGTERM', () => {
  logger.info(colors.magenta('🔴 SIGTERM received, shutting down...'));
  if (server)
    server.close(() => logger.info(colors.magenta('✅ Server closed.')));
});

// Start the server
startServer();
