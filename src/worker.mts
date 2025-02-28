import * as http from "http";
import { client, logger, loadPlugins, SystemConfig } from "#core";

export class XstroServer {
    private database?: string;
    private systemConfig: SystemConfig;

    constructor(systemConfig: SystemConfig) {
        this.systemConfig = systemConfig;
        this.database = systemConfig.DATABASE_URL;
    }

    async start(): Promise<void> {
        try {
            await loadPlugins();
            await client(this.database!);
            http.createServer((req, res) => {
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ alive: req.url === "/" }));
            }).listen(this.systemConfig.PORT);
        } catch (error) {
            logger.error(error);
            process.exit(1);
        }
    }
}
