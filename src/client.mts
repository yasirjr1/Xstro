import { Boom } from '@hapi/boom';
import type { WASocket } from 'baileys';
import { makeWASocket, makeCacheableSignalKeyStore, DisconnectReason, Browsers } from 'baileys';
import { EventEmitter } from 'events';
import { DatabaseSync } from 'node:sqlite';
import * as Logger from 'pino';

import { useSqliteAuthState, CacheStore } from './utilities/index.mts';
import { groupMetadata, SqliteMemoryStore, groupSave, GroupMetaCache } from './model/index.mts';
import { MessagesUpsert } from './index.mts';

EventEmitter.defaultMaxListeners = 10000;
process.setMaxListeners(10000);

export const logger = Logger.pino({
  level: process.env.DEBUG ? 'info' : 'silent',
});

export const client = async (database?: string): Promise<WASocket> => {
  const { state, saveCreds } = useSqliteAuthState(
    new DatabaseSync(database ? database : 'database.db'),
  );
  SqliteMemoryStore();
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

  conn.ev.process(
    /** Event buffers **/

    async (events) => {
      const event = events;

      if (event['connection.update']) {
        const { connection, lastDisconnect } = event['connection.update'];

        if (connection === 'connecting') {
          console.log('connecting...');
        }

        if (connection === 'close')
          (lastDisconnect?.error as Boom)?.output?.statusCode === DisconnectReason.loggedOut
            ? process.exit(1)
            : client(database);

        if (connection === 'open') {
          await conn.sendMessage(conn?.user?.id!, { text: '```Bot is online now!```' });

          console.log(`Connected!`);
        }
      }

      if (event['creds.update']) saveCreds();

      if (event['messages.upsert']) {
        new MessagesUpsert(conn, event['messages.upsert']);
      }
    },
  );

  setInterval(async () => {
    try {
      GroupMetaCache();
      const groups = await conn.groupFetchAllParticipating();

      for (const [id, metadata] of Object.entries(groups)) groupSave(id, metadata);
    } catch (error) {
      throw new Boom(error.message as Error);
    }
  }, 300 * 1000);
  conn.ev.flush();
  return conn;
};
