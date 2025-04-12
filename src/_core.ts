import { makeWASocket, makeCacheableSignalKeyStore, Browsers } from 'baileys';
import config from '../config.ts';
import makeEvents from './messaging/_process.ts';
import { log, connectProxy, useSqliteAuthStore } from './utils/index.ts';
import { getMessage, cachedGroupMetadata } from './models/index.ts';

export const initConnection = async () => {
 try {
  const { state, saveCreds } = await useSqliteAuthStore();
  const sock = makeWASocket({
   auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, log),
   },
   printQRInTerminal: config.DEV_MODE,
   agent: config.PROXY_URI ? connectProxy(config.PROXY_URI) : undefined,
   logger: log,
   browser: Browsers.windows('Chrome'),
   emitOwnEvents: true,
   getMessage,
   cachedGroupMetadata,
  });
  return new makeEvents(sock, { saveCreds });
 } catch (error) {
  log.error({ error }, 'Failed to initialize connection');
 }
};
