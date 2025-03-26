import dotenv from 'dotenv';
import { createServer } from 'http';
import { loadPlugins } from './src/files.mts';
import { makeClientConnection } from './src/client.mts';
import { checkNodeVersion } from './utilities/node-v.mts';
import { getSession } from './utilities/session.mts';
import type { Server, ServerResponse, IncomingMessage } from 'http';

dotenv.config();

(async (): Promise<Server<typeof IncomingMessage, typeof ServerResponse>> => {
  await checkNodeVersion();
  await getSession();
  await loadPlugins();
  await makeClientConnection();

  return createServer((_, res) => {
    res.writeHead(200);
    res.end();
  }).listen(8000);
})();
