/* eslint-disable no-unused-vars */
import './string';
import './router';
import './server';
import './array';

declare global {
  interface Object {
    _via_pipe<T, R>(f: (value: T) => R): R;
  }
}

/**
 * This is also known as a method call chain
 * Also known as .pipe();
 */
Object.defineProperty(Object.prototype, '_via_pipe', {
  value<T, R>(f: (value: T) => R) {
    return f(this.valueOf() as T);
  },
  enumerable: false,
  configurable: true,
});
