import './util/prototype'; //! must be first
import startServer from './util/server/startServer';
import { SocketServices } from './app/modules/socket/Socket.service';
import { logger } from './util/logger/logger';
import colors from 'colors';

startServer().then(server => {
  server?.__pipes(SocketServices.init);
  logger.info(colors.green('🚀 Socket services initialized successfully'));
});
