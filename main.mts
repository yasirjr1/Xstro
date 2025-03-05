import dotenv from "dotenv";
import * as xprocess from "./src/index.mjs";
import { createServer } from "http";

dotenv.config();

const SESSION = process.env.SESSION ? process.env.SESSION : "XSTRO_97_30_78";
const DB_URI = process.env.DB_URI ? process.env.DB_URI : undefined;
const PORT = 8000;

const startBot = async (): Promise<void> => {
     /** Replace here with your own custom session sever */
     try {
          await xprocess.fetchSessionfromServer(`https://xstrosession.koyeb.app/session?session=${SESSION.trim()}`, {
               decode: true,
          });
     } catch (error) {}

     if (!(xprocess.getSessionId() === SESSION)) {
          await xprocess.cfaSqliteMigrator("session", DB_URI ?? "database.db");
          xprocess.setSessionId(SESSION);
     }
     await xprocess.loadPlugins();
     await xprocess.client(DB_URI);
     const server = createServer((req, res) => {
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end(PORT);
     });
     server.listen(PORT, () => {
          console.log(`PORT: http://localhost://${PORT}`);
     });
};

await startBot();
