const logger = {
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  http: jest.fn(),
};

export const httpLogger = jest.fn();
export default logger;
