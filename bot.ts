import logger from './src/utils/logger.js';
import { initConnection } from './src/core/connection.js';

(async (): Promise<void> => {
  try {
    await initConnection();
  } catch (error) {
    logger.error(error);
  }
})();
