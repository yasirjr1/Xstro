import {
  makeWASocket,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  Browsers,
} from 'baileys';
import config from '../../config';
import MakeListeners from '../api/makeEvents';
import { logger } from '../utils';
import { connectProxy } from '../utils';
import { getMessage, cachedGroupMetadata } from '../models';

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
