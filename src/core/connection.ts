import {
  makeWASocket,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  Browsers,
} from 'baileys';
import config from '../../config.js';
import logger from '../utils/logger.js';
import MakeListeners from '../hooks/api/listeners.js';
import { getMessage } from '../models/store.js';
import { cachedGroupMetadata } from '../models/group.js';
import { connectProxy } from '../hooks/proxy.js';

export const initConnection = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('./session');
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
};
