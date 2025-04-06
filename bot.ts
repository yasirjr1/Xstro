import { logger } from './src/utils';
import { initConnection } from './src/core';
import { syncPlugins } from './src/functions';

try {
  await syncPlugins('../plugins', '.mts');
  await initConnection();
} catch (error) {
  logger.error(error);
}
