declare global {
  interface String {
    /**
     * Converts a string to snake case
     * @returns string
     */
    toCapitalize(): string;
  }
}

Object.defineProperty(String.prototype, 'toCapitalize', {
  value: function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
  enumerable: false,
  configurable: true,
});

export {};
