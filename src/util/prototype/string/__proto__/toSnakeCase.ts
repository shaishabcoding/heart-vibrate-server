declare global {
  interface String {
    /**
     * Converts a string to snake case
     * @returns string
     */
    toSnakeCase(): string;
  }
}

String.prototype.toSnakeCase = function () {
  return this.replace(/\s+/g, '_').replace(/([a-z])([A-Z])/g, '$1_$2');
};

export {};
