import cors from 'cors';
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './routes';
import { Morgan } from './shared/morgen';
import cookieParser from 'cookie-parser';

const app = express();

//morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

//body parser
app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//file retrieve
app.use(express.static('uploads'));

//router
app.use('/api/v1', router);

//file retrieve
app.use(express.static('uploads'));
app.use('/api/v1', express.static('uploads'));

//live response
app.get('/', (_req: Request, res: Response) => {
  res.redirect('http://localhost:5173');
});

//global error handle
app.use(globalErrorHandler);

//handle not found route;
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Not found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: 'API NOT FOUND',
      },
    ],
  });
});

export default app;
