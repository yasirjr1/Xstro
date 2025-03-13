import dotenv from 'dotenv';
import { createServer } from 'http';
import { checkNodeVersion, loadPlugins, client } from './index.mts';
dotenv.config();

const startApp = async (): Promise<void> => {
  await checkNodeVersion();
  await loadPlugins();
  await client();
  createServer((req, res) => {
    res.writeHead(200);
    res.end('8000');
  }).listen(8000);
};

await startApp();
