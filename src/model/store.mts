import { getDb } from './database.mts';
import type { StatementSync, SupportedValueType, DatabaseSync } from 'node:sqlite';
import type { WAMessage, MessageUpsertType, GroupMetadata } from 'baileys';

function SqliteMemoryStore(): void {
  const db = getDb();
  db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
            remoteJid TEXT,
            id TEXT,
            fromMe INTEGER,
            participant TEXT,
            messageTimestamp INTEGER,
            status TEXT,
            data JSON,
            requestId TEXT,
            upsertType TEXT,
            PRIMARY KEY (remoteJid, id, fromMe)
        )
    `);
}

function GroupMetaCache(): void {
  const db: DatabaseSync = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS group_metadata (
      jid TEXT PRIMARY KEY,
      metadata JSON
    );
  `);
}

export const groupMetadata = (jid: string): GroupMetadata | undefined => {
  GroupMetaCache();
  const db: DatabaseSync = getDb();

  const stmt: StatementSync = db.prepare(`SELECT metadata FROM group_metadata WHERE jid = ?;`);
  const result = stmt.get(jid) as { metadata: string } | undefined;

  return result && result.metadata ? JSON.parse(result.metadata) : undefined;
};

export function upsertM(upsert: {
  messages: WAMessage[];
  type: MessageUpsertType;
  requestId?: string;
}): void {
  SqliteMemoryStore();
  const db = getDb();
  const stmt: StatementSync = db.prepare(`
        INSERT OR REPLACE INTO messages (
            remoteJid, 
            id, 
            fromMe, 
            participant, 
            messageTimestamp, 
            status, 
            data, 
            requestId, 
            upsertType
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

  for (const message of upsert.messages) {
    const timestamp =
      typeof message.messageTimestamp === 'number' ? message.messageTimestamp : Date.now();
    const params: SupportedValueType[] = [
      message.key.remoteJid ?? null,
      message.key.id ?? null,
      message.key.fromMe ? 1 : 0,
      message.participant ?? null,
      timestamp,
      message.status ?? null,
      JSON.stringify(message),
      upsert.requestId ?? null,
      upsert.type,
    ];
    stmt.run(...params);
  }
}

export function loadMessage(
  id: string,
): { [key: string]: string | number | Long | null | undefined } | null {
  const db = getDb();
  const stmt: StatementSync = db.prepare(`
        SELECT data 
        FROM messages 
        WHERE id = ?
    `);
  const message = stmt.get(id) as { data: string } | undefined;
  return message ? JSON.parse(message.data) : null;
}
