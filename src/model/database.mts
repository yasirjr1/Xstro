import Database from 'better-sqlite3';
import { logger } from '../client.mts';
import { environment } from '../../config.ts';

let database: Database.Database | null = null;

export const getDb = async (): Promise<Database.Database> => {
  if (!database) {
    const verboseDebug = (message?: unknown, ...args: unknown[]): void => {
      const msg = String(message ?? null);
      logger.info(msg, ...args);
    };
    const dbOptions: Database.Options = {};
    if (environment.DEBUG === true) dbOptions.verbose = verboseDebug;

    database = new Database('database.db', dbOptions);
  }
  return database;
};
