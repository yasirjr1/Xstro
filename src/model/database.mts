import Database from 'better-sqlite3';
import { logger } from '../client.mts';

let database: Database.Database | null = null;

export const getDb = async (): Promise<Database.Database> => {
  if (!database) {
    database = new Database('database.db', {
      verbose: (message?: unknown, ...args: unknown[]): void => {
        const msg = String(message ?? null);
        logger.info(msg, ...args);
      },
    });
  }
  return database;
};
