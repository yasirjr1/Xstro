import type { WASocket } from 'baileys';
import { makeWASocket, makeCacheableSignalKeyStore, Browsers } from 'baileys';
import { EventEmitter } from 'events';
import { DatabaseSync } from 'node:sqlite';
import * as Logger from 'pino';

import { groupMetadata } from './model/index.mts';
import { useSqliteAuthState, CacheStore } from './utilities/index.mts';
import { ConnectionUpdate, GroupSync, MessagesUpsert } from './classes/index.mts';

EventEmitter.defaultMaxListeners = 10000;
process.setMaxListeners(10000);

export const logger = Logger.pino({
  level: process.env.DEBUG ? 'info' : 'silent',
});

export const client = async (): Promise<WASocket> => {
  const { state, saveCreds } = useSqliteAuthState(new DatabaseSync('database.db'));
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
    const event = events;

    if (event['connection.update']) new ConnectionUpdate(conn, event['connection.update']);

    if (event['creds.update']) saveCreds();

    if (event['messages.upsert']) new MessagesUpsert(conn, event['messages.upsert']);
  });

  /** Save Group Metadata and avoid reduant requests to WA Servers */
  const groupSync = new GroupSync(conn);
  groupSync.start();

  return conn;
};
