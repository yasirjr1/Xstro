import Database from 'better-sqlite3';
import { logger } from '../client.mts';

let database: Database.Database | null = null;

export const getDb = (): Database.Database => {
  if (!database) {
    database = new Database('database.db', {
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      verbose: (message?: unknown, ...Args: unknown[]) => {
        const msgs = String(message ?? 'No message');
        logger.info(msgs, ...Args);
      },
    });
  }
  return database;
};
