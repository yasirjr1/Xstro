import { makeWASocket, makeCacheableSignalKeyStore, Browsers } from 'baileys';
import config from '../../config.ts';
import makeEvents from '../messaging/makeEvents.ts';
import { logger, connectProxy, useSqliteAuthStore } from '../utils/index.ts';
import { getMessage, cachedGroupMetadata } from '../models/index.ts';

export const initConnection = async () => {
  try {
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
    return await new makeEvents(sock, { saveCreds }).manageProcesses();
  } catch (error) {
    logger.error({ error }, 'Failed to initialize connection');
  }
};
