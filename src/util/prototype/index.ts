/* eslint-disable no-unused-vars */
import './string';
import './router';
import './server';
import './array';

declare global {
  interface Object {
    _pipe<T, R>(f: (value: T) => R): R;
  }
}

// pipe create some issus, so i use _pipe
Object.defineProperty(Object.prototype, '_pipe', {
  value<T, R>(f: (value: T) => R) {
    return f(this.valueOf() as T);
  },
  enumerable: false,
  configurable: true,
});
