import { logger } from './src/utils/index.ts';
import { initConnection, syncPlugins } from './src/core/index.ts';
import { initSession } from './src/utils/index.ts';

try {
  await initSession();
  await syncPlugins('../plugins', ['.mjs', '.mts']);
  await initConnection();
} catch (error) {
  logger.error(error);
}
