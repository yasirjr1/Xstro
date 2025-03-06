import * as xprocess from "./src/index.mjs";
import * as config from "./set.mjs";
import { createServer } from "http";

const startBot = async (): Promise<void> => {
     await xprocess.fetchSessionfromServer(config.SESSION_SERVER_URL, {
          decode: true,
     });
     if (!(xprocess.getSessionId() === config.SESSION__ID)) {
          await xprocess.cfaSqliteMigrator("session", config.DATABASE_URL ?? "database.db");
          xprocess.setSessionId(config.SESSION__ID);
     }
     await xprocess.loadPlugins();
     await xprocess.client(config.DATABASE_URL);
     createServer((req, res) => {
          res.writeHead(200);
          res.end(config.HTTP_PORT);
     }).listen(config.HTTP_PORT);
};

await startBot();
