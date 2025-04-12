import { initConnection } from './src/_core.ts';
import { syncPlugins } from './src/messaging/plugins.ts';
import { initSession } from './src/utils/migrate.ts';
import { log } from './src/utils/logger.ts';

try {
 await initSession();
 await syncPlugins('../plugins', ['.mjs', '.mts']);
 await initConnection();
} catch (error) {
 log.error(error);
}
