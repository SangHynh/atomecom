import appConfig from '@shared/configs/app.config.js';
import logger from './logger.js';

export const isDev = appConfig!.app.isProduction === false;

/* Measures the execution time of a function. */
export const timeit = async <T>(
  fn: (...args: any[]) => Promise<T> | T,
  label?: string,
): Promise<T> => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  const taskName = label || fn.name || 'Anonymous Task';
  logger.info(`Execution ${taskName} ::: ${(end - start).toFixed(3)}ms`);
  return result;
};
