import dotenv from 'dotenv';
import { createServer } from 'http';
import { config } from '../config.mts';
import { checkNodeVersion, loadPlugins, client } from './index.mts';
dotenv.config();

const startBot = async (): Promise<void> => {
  await checkNodeVersion();
  await loadPlugins();
  await client(config.DATABASE);
  createServer((req, res) => {
    res.writeHead(200);
    res.end(config.PORT.toString());
  }).listen(config.PORT);
};

await startBot();
