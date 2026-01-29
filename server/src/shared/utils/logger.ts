import winston from 'winston';
import morgan from 'morgan';
import chalk from 'chalk';

const levels = {
  error: 0,
  http: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Format for log files (Plain text)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.uncolorize(), // Remove chalk/ansi colors for files
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`,
  ),
);

// Format for terminal (Colored)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

const logger = winston.createLogger({
  level: 'debug',
  levels,
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: fileFormat,
    }),
    new winston.transports.File({
      filename: 'logs/request.log',
      level: 'http',
      format: fileFormat,
    }),
    new winston.transports.File({
      filename: 'logs/all.log',
      format: fileFormat,
    }),
  ],
});

export const httpLogger = morgan((tokens, req, res) => {
  const statusStr = tokens.status?.(req, res) || '0';
  const status = Number(statusStr);

  const statusColor =
    status >= 500
      ? chalk.red.bold
      : status >= 400
        ? chalk.yellow.bold
        : status >= 300
          ? chalk.cyan
          : chalk.green.bold;

  // Use optional chaining for all token functions
  const method = chalk.blue.bold(tokens.method?.(req, res) || '');
  const url = chalk.white(tokens.url?.(req, res) || '');
  const responseTime = chalk.gray(
    `${tokens['response-time']?.(req, res) || 0}ms`,
  );
  const remoteAddr = chalk.dim(tokens['remote-addr']?.(req, res) || 'unknown');

  const message = `${remoteAddr} ${method} ${url} ${statusColor(status)} - ${responseTime}`;

  logger.http(message);
  return null;
});

export default logger;
