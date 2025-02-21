class ServerError extends Error {
  constructor(
    // eslint-disable-next-line no-unused-vars
    public readonly statusCode: number,
    message = 'An error occurred',
    stack?: string,
  ) {
    super(message);
    this.name = 'ServerError';

    if (stack) this.stack = stack;
    else Error.captureStackTrace(this, this.constructor);
  }
}

export default ServerError;
