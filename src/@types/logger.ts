export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export interface ILogger {
  level: string;
  child(obj: Record<string, unknown>): ILogger;
  trace(obj: unknown, msg?: unknown): void;
  debug(obj: unknown, msg?: unknown): void;
  info(obj: unknown, msg?: unknown): void;
  warn(obj: unknown, msg?: unknown): void;
  error(obj: unknown, msg?: unknown): void;
}
