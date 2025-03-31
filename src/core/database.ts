import Database from '@astrox11/sqlite';
import config from '../../config.js';

const database = await (async function () {
  return new Database(config.DATABASE, {});
})();

export default database;
