import dotenv from 'dotenv';
import { createServer } from 'http';
import { checkNodeVersion, getSession, loadPlugins } from './index.mts';
import { client } from './functions/index.mts';

dotenv.config();

const startApp = async (): Promise<void> => {
  await checkNodeVersion();
  await getSession();
  await loadPlugins();
  await client();

  const http = createServer((req, res) => {
    res.writeHead(200);
    res.end();
  });

  http.listen(8000);
};

startApp();
