import { ILogger } from '../@types/logger.js';

const LEVELS = { trace: 10, debug: 20, info: 30, warn: 40, error: 50, fatal: 60 };
const currentLevel = LEVELS[process.env.LOG_LEVEL || 'info'] || 30;

function logIt(level, data, msg) {
  if (LEVELS[level] < currentLevel) return;

  const entry = {
    level,
    ...(typeof data === 'object' ? data : { msg: data }),
    ...(msg ? { msg } : {}),
  };

  console[level === 'error' || level === 'fatal' ? 'error' : 'log'](JSON.stringify(entry));
}

const logger: ILogger = {
  level: process.env.LOG_LEVEL || 'info',
  trace: (d: object, m: string) => logIt('trace', d, m),
  debug: (d: object, m: string) => logIt('debug', d, m),
  info: (d: object, m: string) => logIt('info', d, m),
  warn: (d: object, m: string) => logIt('warn', d, m),
  error: (d: object, m: string) => logIt('error', d, m),
  child: (obj: object) => {
    const childLogger = { ...logger };
    Object.keys(LEVELS).forEach((lvl) => {
      childLogger[lvl] = (d: object, m: string) =>
        logIt(lvl, { ...obj, ...(typeof d === 'object' ? d : {}) }, typeof d === 'object' ? m : d);
    });
    childLogger.child = (newObj) => logger.child({ ...obj, ...newObj });
    return childLogger;
  },
};

export default logger;
