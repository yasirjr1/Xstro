import Database from '@astrox11/sqlite';
import config from '../../config.ts';

/**
 * Custom ORM handles everything effortlessly, and it supports only `node:sqlite`
 * It can do everything Sequelize does, but simpler, easier and very robust as well
 * Library is stable and can be found at https://github.com/AstroX11/sqlite
 * This ORM is Promisfyable, for asynchronous tasks
 */
const database = new Database(config.DATABASE, {
  open: true,
  enableForeignKeyConstraints: true,
  readOnly: false,
  verbose: config.DEV_MODE,
});

process.on('exit', () => {
  database.close();
});

process.on('SIGINT', async () => {
  database.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  database.close();
  process.exit(0);
});

process.on('uncaughtException', async () => {
  database.close();
  process.exit(1);
});

process.on('unhandledRejection', async () => {
  database.close();
  process.exit(1);
});

export default database;
