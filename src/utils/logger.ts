import config from '../../config.ts';
import type { ILogger } from '../types/index.ts';

const LEVELS = Object.freeze({
 trace: 10,
 debug: 20,
 info: 30,
 warn: 40,
 error: 50,
 fatal: 60,
});

const currentLevel = LEVELS[(config.LOGGER as keyof typeof LEVELS) || 'info'];

const logger = (level: keyof typeof LEVELS, data: unknown, msg?: unknown) => {
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

export const log: ILogger = {
 level: process.env.LOG_LEVEL || 'info',

 trace: (data, msg) => logger('trace', data, msg),
 debug: (data, msg) => logger('debug', data, msg),
 info: (data, msg) => logger('info', data, msg),
 warn: (data, msg) => logger('warn', data, msg),
 error: (data, msg) => logger('error', data, msg),

 child: (obj: Record<string, unknown>) => {
  const childLog =
   (level: keyof typeof LEVELS) => (data: unknown, msg?: string) => {
    const mergedData = {
     ...obj,
     ...(typeof data === 'object' && data !== null ? data : {}),
    };
    const message =
     typeof data === 'object' && data !== null ? msg : String(data);
    logger(level, mergedData, message);
   };

  return {
   ...log,
   trace: childLog('trace'),
   debug: childLog('debug'),
   info: childLog('info'),
   warn: childLog('warn'),
   error: childLog('error'),
   fatal: childLog('fatal'),
   child: (newObj) => log.child({ ...obj, ...newObj }),
  };
 },
};
