import { initConnection } from './src/core/connection.js';

(async (): Promise<void> => {
  try {
    await initConnection();
  } catch (error) {
    throw new Error(error.message);
  }
})();
