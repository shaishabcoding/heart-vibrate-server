import { hashPassword } from '../../../../app/modules/auth/Auth.utils';

declare global {
  interface String {
    hash(): Promise<string>;
  }
}

Object.defineProperties(String.prototype, {
  hash: {
    value: function () {
      return hashPassword(this);
    },
    enumerable: false,
    configurable: true,
    writable: false,
  },
});
