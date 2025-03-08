import dotenv from 'dotenv';
import { createServer } from 'http';
import { Boom } from '@hapi/boom';
import { config } from '../config.mts';
import {
  checkNodeVersion,
  fetchSessionfromServer,
  getSessionId,
  cfaSqliteMigrator,
  setSessionId,
  loadPlugins,
  client,
} from './index.mts';
dotenv.config();

const startBot = async (): Promise<void> => {
  await checkNodeVersion();
  try {
    await fetchSessionfromServer(config.SERVER + config.SESSION, {
      decode: true,
    });
    if (!(getSessionId() === config.SESSION)) {
      await cfaSqliteMigrator('session', config.DATABASE ?? 'database.db');
      setSessionId(config.SESSION);
    }
  } catch (error) {
    console.error(new Boom(error.message as Error));
  }
  await loadPlugins();
  await client(config.DATABASE);
  createServer((req, res) => {
    res.writeHead(200);
    res.end(config.PORT.toString());
  }).listen(config.PORT);
};

await startBot();
