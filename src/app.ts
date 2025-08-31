import cors from 'cors';
import express from 'express';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import RoutesV1 from './routes/v1';
import { Morgan } from './util/logger/morgen';
import cookieParser from 'cookie-parser';
import config from './config';
import { fileRetriever, fileTypes } from './app/middlewares/capture';
import { notFoundError } from './errors';

/**
 * The main application instance
 *
 * This is the main application instance that sets up the Express server.
 * It configures middleware, routes, and error handling.
 */
const app = express();

// Serve static files
app.use(express.static('public'));
fileTypes.forEach(type => app.get(`/${type}/:filename`, fileRetriever));

// Configure middleware
app.use(
  cors({ origin: config.server.allowed_origins, credentials: true }),

  Morgan.successHandler,
  Morgan.errorHandler,

  (req, res, next) =>
    (req.headers['stripe-signature']
      ? express.raw({ type: 'application/json' })
      : express.json())(req, res, next),

  express.text(),
  express.urlencoded({ extended: true }),
  cookieParser(),
);

// API routes
app.use('/api/v1', RoutesV1);

// 404 handler
app.use(({ originalUrl }, _, next) => {
  next(notFoundError(originalUrl));
});

// Error handler
app.use(globalErrorHandler);

export default app;
