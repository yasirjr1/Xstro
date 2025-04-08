import { logger } from './src/utils/index.ts';
import { initConnection } from './src/core/index.ts';
import { syncPlugins } from './src/functions/index.ts';

try {
  await syncPlugins('../plugins', ['.mjs', '.mts']);
  await initConnection();
} catch (error) {
  logger.error(error);
}
