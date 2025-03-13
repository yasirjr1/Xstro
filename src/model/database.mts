// database.mts
import Database from 'better-sqlite3';

let database: Database.Database | null = null;

/** Function that allows other functions to manage data in our Sqlite3 DataBase */
export const getDb = (): Database.Database => {
  if (!database) {
    database = new Database('database.db', {
      // better-sqlite3 options
      verbose: console.log, // optional: for debugging
      // foreign key constraints are enabled by default in better-sqlite3
    });
  }
  return database;
};
