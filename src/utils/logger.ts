import config from '../../config.ts';
import type { ILogger } from '../types';

const LEVELS = Object.freeze({
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
});

const currentLevel = LEVELS[(config.LOGGER as keyof typeof LEVELS) || 'info'];

const log = (level: keyof typeof LEVELS, data: unknown, msg?: unknown) => {
  if (LEVELS[level] < currentLevel) return;

  const entry = msg
    ? {
        ...(typeof data === 'object' && data !== null ? data : { msg: data }),
        msg,
      }
    : typeof data === 'object' && data !== null
      ? { ...data }
      : { msg: data };

  if (level === 'error' || level === 'fatal') {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
};

export const logger: ILogger = {
  level: process.env.LOG_LEVEL || 'info',

  trace: (data, msg) => log('trace', data, msg),
  debug: (data, msg) => log('debug', data, msg),
  info: (data, msg) => log('info', data, msg),
  warn: (data, msg) => log('warn', data, msg),
  error: (data, msg) => log('error', data, msg),

  child: (obj: Record<string, unknown>) => {
    const childLog = (level: keyof typeof LEVELS) => (data: unknown, msg?: string) => {
      const mergedData = { ...obj, ...(typeof data === 'object' && data !== null ? data : {}) };
      const message = typeof data === 'object' && data !== null ? msg : String(data);
      log(level, mergedData, message);
    };

    return {
      ...logger,
      trace: childLog('trace'),
      debug: childLog('debug'),
      info: childLog('info'),
      warn: childLog('warn'),
      error: childLog('error'),
      fatal: childLog('fatal'),
      child: (newObj) => logger.child({ ...obj, ...newObj }),
    };
  },
};
