/* eslint-disable no-unused-vars */
import { Server } from 'http';

declare module 'http' {
  interface Server {
    inject: (...fns: ((server: Server) => void)[]) => this;
  }
}

Server.prototype.inject = function (...fns) {
  fns.forEach(fn => fn(this));

  return this;
};

export {};
