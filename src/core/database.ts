import Database from '@astrox11/sqlite';
import config from '../../config.js';

const database = new Database(config.DATABASE, {
  open: true,
  enableForeignKeyConstraints: true,
  readOnly: false,
});

export default database;
