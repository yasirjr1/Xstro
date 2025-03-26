import { EventEmitter } from 'events';
import { makeWASocket, makeCacheableSignalKeyStore, Browsers } from 'baileys';
import * as Logger from 'pino';

import { environment } from '../config.ts';
import { getDb } from './database.mts';
import { useSqliteAuthState } from '../databases/session.mts';
import { groupMetadata, saveReceipts } from '../databases/store.mts';
import { ConnectionUpdate, GroupCache, MessagesUpsert } from '../controllers/index.mts';
import { CacheStore } from './store.mts';
import type { Client } from '../Types/Client.mts';

EventEmitter.defaultMaxListeners = 10000;
process.setMaxListeners(10000);

export const logger = Logger.pino({
  level: environment.DEBUG ? 'info' : 'silent',
});

export const makeClientConnection = async (): Promise<Client> => {
  const database = await getDb();
  const { state, saveCreds } = await useSqliteAuthState(database);
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
    if (events['creds.update']) await saveCreds();

    if (events['connection.update']) new ConnectionUpdate(conn, events['connection.update']);

    if (events['messages.upsert']) new MessagesUpsert(conn, events['messages.upsert']);

    if (events['message-receipt.update']) await saveReceipts(events['message-receipt.update']);
  });

  await new GroupCache(conn).start();

  return conn;
};
