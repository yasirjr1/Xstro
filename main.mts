import * as xprocess from "./src/index.mjs";

const SESSION = process.env.SESSION ? process.env.SESSION : "XSTRO_97_30_78";
const DB_URI = process.env.DB_URI ? process.env.DB_URL : undefined;

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
};

await startBot();
