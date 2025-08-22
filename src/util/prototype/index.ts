/* eslint-disable no-unused-vars */
import './string';
import './router';
import './server';
import './array';

declare global {
  interface Object {
    __pipes<T, R>(...fs: ((value: T) => R)[]): T;
  }
}

/**
 * This is also known as a method call chain
 * Also known as .pipe();
 */
Object.defineProperty(Object.prototype, '__pipes', {
  async value<T, R>(...fs: ((value: T) => R)[]) {
    for (const f of fs) await f(this);
    return this;
  },
  enumerable: false,
  configurable: true,
});
