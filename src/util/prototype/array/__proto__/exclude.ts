/* eslint-disable no-unused-vars */
declare global {
  interface Array<T> {
    excludes(...values: T[]): T[];
  }
}

Object.defineProperties(Array.prototype, {
  excludes: {
    value<T>(...values: T[]): T[] {
      return this.filter((item: T) => !values.includes(item));
    },
    enumerable: false,
    configurable: true,
  },
});

export {};
