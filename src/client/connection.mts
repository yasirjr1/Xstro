import { makeWASocket, makeCacheableSignalKeyStore, Browsers } from 'baileys';
import { EventEmitter } from 'events';
import * as Logger from 'pino';

import { getDb } from '../model/database.mts';
import {
  ConnectionUpdate,
  GroupCache,
  MessagesUpsert,
  CacheStore,
  groupMetadata,
  useSqliteAuthState,
  type Client,
} from '../index.mts';

EventEmitter.defaultMaxListeners = 10000;
process.setMaxListeners(10000);

export const logger = Logger.pino({
  level: 'info',
});

export const client = async (): Promise<Client> => {
  const db = await getDb();
  const { state, saveCreds } = await useSqliteAuthState(db);
  const conn = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger, new CacheStore()),
    },
    printQRInTerminal: true,
    logger,
    browser: Browsers.macOS('Desktop'),
    emitOwnEvents: true,
    cachedGroupMetadata: async (jid) => groupMetadata(jid),
  });

  conn.ev.process(async (events) => {
    if (events['creds.update']) {
      await saveCreds();
    }

    if (events['connection.update']) {
      new ConnectionUpdate(conn, events['connection.update']);
    }

    if (events['messages.upsert']) {
      new MessagesUpsert(conn, events['messages.upsert']);
    }

    if (events['message-receipt.update']) {
      logger.info(events['message-receipt.update'][0]);
    }
  });

  // Saves Group Metadata for super fast Group Processing
  const cache = new GroupCache(conn);
  await cache.start();

  return conn;
};
