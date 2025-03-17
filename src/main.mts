import dotenv from 'dotenv';
import { createServer } from 'http';
import { checkNodeVersion, loadPlugins, client } from './index.mts';

dotenv.config();

const startApp = async (): Promise<void> => {
  await checkNodeVersion();
  await loadPlugins();
  await client();

  const http = createServer((req, res) => {
    res.writeHead(200);
    res.end();
  });

  http.listen(8000);
};

startApp();
