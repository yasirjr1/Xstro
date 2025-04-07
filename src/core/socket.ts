import {
  makeWASocket,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  Browsers,
} from 'baileys';
import config from '../../config.ts';
import MakeListeners from '../api/makeEvents.ts';
import { logger, connectProxy } from '../utils/index.ts';
import { getMessage, cachedGroupMetadata } from '../models/index.ts';
import { useSqliteAuthStore } from '../functions/index.ts';

export const initConnection = async () => {
  try {
    logger.info('Starting connection...');
    //  const { state, saveCreds } = await useMultiFileAuthState(config.SESSION_DIR || './session');
    const { state, saveCreds } = await useSqliteAuthStore();
    const sock = makeWASocket({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
      printQRInTerminal: config.DEV_MODE,
      agent: config.PROXY_URI ? connectProxy(config.PROXY_URI) : undefined,
      logger,
      browser: Browsers.windows('Chrome'),
      emitOwnEvents: true,
      getMessage,
      cachedGroupMetadata,
    });
    return await new MakeListeners(sock, { saveCreds }).manageProcesses();
  } catch (error) {
    logger.error({ error }, 'Failed to initialize connection');
    throw error;
  }
};
