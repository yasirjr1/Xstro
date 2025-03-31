import { ILogger, LogLevel } from '../@types/logger.js';

const logLevels: Record<LogLevel, number> = {
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10,
};

const currentLevelThreshold = logLevels[(process.env.LOG_LEVEL || 'info') as LogLevel] || 30;

function createLogEntry(level: LogLevel, obj: unknown, msg?: string) {
  if (logLevels[level] < currentLevelThreshold) {
    return;
  }

  const logEntry = {
    level,
    timestamp: new Date().toISOString(),
    ...(typeof obj === 'object' && obj !== null ? obj : { msg: obj }),
    ...(msg ? { msg } : {}),
  };

  const logString = JSON.stringify(logEntry);
  if (level === 'fatal' || level === 'error') {
    console.error(logString);
  } else {
    console.log(logString);
  }
}

const logger: ILogger = {
  level: process.env.LOG_LEVEL || 'info',
  child(obj: Record<string, unknown>) {
    const childLogger: ILogger = {
      ...logger,
      trace: (childObj, msg) =>
        createLogEntry(
          'trace',
          {
            ...obj,
            ...(typeof childObj === 'object' && childObj !== null ? childObj : { msg: childObj }),
          },
          msg,
        ),
      debug: (childObj, msg) =>
        createLogEntry(
          'debug',
          {
            ...obj,
            ...(typeof childObj === 'object' && childObj !== null ? childObj : { msg: childObj }),
          },
          msg,
        ),
      info: (childObj, msg) =>
        createLogEntry(
          'info',
          {
            ...obj,
            ...(typeof childObj === 'object' && childObj !== null ? childObj : { msg: childObj }),
          },
          msg,
        ),
      warn: (childObj, msg) =>
        createLogEntry(
          'warn',
          {
            ...obj,
            ...(typeof childObj === 'object' && childObj !== null ? childObj : { msg: childObj }),
          },
          msg,
        ),
      error: (childObj, msg) =>
        createLogEntry(
          'error',
          {
            ...obj,
            ...(typeof childObj === 'object' && childObj !== null ? childObj : { msg: childObj }),
          },
          msg,
        ),
      child: (newObj) => childLogger.child({ ...obj, ...newObj }),
    };
    return childLogger;
  },
  trace: (obj, msg) => createLogEntry('trace', obj, msg),
  debug: (obj, msg) => createLogEntry('debug', obj, msg),
  info: (obj, msg) => createLogEntry('info', obj, msg),
  warn: (obj, msg) => createLogEntry('warn', obj, msg),
  error: (obj, msg) => createLogEntry('error', obj, msg),
};

export default logger;
