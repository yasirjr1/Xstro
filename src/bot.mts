import dotenv from 'dotenv';
import { createServer } from 'http';
import { checkNodeVersion, getSession, loadPlugins } from './index.mts';
import { client } from './client/index.mts';

dotenv.config();

(async (): Promise<void> => {
  await checkNodeVersion();
  await getSession();
  await loadPlugins();
  await client();

  const http = createServer((_, res) => {
    res.writeHead(200);
    res.end();
  });

  http.listen(8000);
})();
