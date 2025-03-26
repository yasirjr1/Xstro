import dotenv from 'dotenv';
import { createServer } from 'http';
import { client } from './src/client.mts';
import { checkNodeVersion, getSession, loadPlugins } from './src/index.mts';
import type { Server, ServerResponse, IncomingMessage } from 'http';

dotenv.config();

(async (): Promise<Server<typeof IncomingMessage, typeof ServerResponse>> => {
  await checkNodeVersion();
  await getSession();
  await loadPlugins();
  await client();

  return createServer((_, res) => {
    res.writeHead(200);
    res.end();
  }).listen(8000);
})();
