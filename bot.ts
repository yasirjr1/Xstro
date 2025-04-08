import { logger } from './src/utils/index.ts';
import { initConnection } from './src/core/index.ts';
import { initSession, syncPlugins } from './src/functions/index.ts';

try {
  await initSession();
  await syncPlugins('../plugins', ['.mjs', '.mts']);
  await initConnection();
} catch (error) {
  logger.error(error);
}
