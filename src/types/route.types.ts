import { RequestHandler, Router } from 'express';

export type TRoute = {
  path: string;
  middlewares?: RequestHandler[];
  route: Router;
};
