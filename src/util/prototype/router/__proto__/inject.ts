/* eslint-disable no-unused-vars */
import { Router } from 'express';
import { TRoute } from '../../../../types/route.types';

declare global {
  interface Function {
    inject(routes: TRoute[]): Router;
  }
}

Function.prototype.inject = function (routes: TRoute[]) {
  routes.forEach(({ path, middlewares = [], route }) =>
    (this as Router).use(path, ...middlewares, route),
  );

  return this as Router;
};

export {};
