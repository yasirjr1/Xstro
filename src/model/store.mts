import { getDb } from './database.mts';
import type Database from 'better-sqlite3';
import type { Statement } from 'better-sqlite3';
import { type WAMessage, type MessageUpsertType, type GroupMetadata, WAProto } from 'baileys';

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
  const db: Database.Database = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS group_metadata (
      jid TEXT PRIMARY KEY,
      metadata JSON
    )
  `);
}

function ContactStore(): void {
  const db: Database.Database = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      jid TEXT PRIMARY KEY,
      pushName TEXT,
      verifiedName TEXT,
      lid TEXT,
      bio TEXT
    )
  `);
}

export const groupMetadata = (jid: string): GroupMetadata | undefined => {
  GroupMetaCache();
  const db: Database.Database = getDb();

  const stmt: Statement = db.prepare(`SELECT metadata FROM group_metadata WHERE jid = ?`);
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
  const stmt: Statement = db.prepare(`
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
    const params = [
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
    stmt.run(params);
  }
}

export function loadMessage(id: string): WAMessage | null {
  const db = getDb();
  const stmt: Statement = db.prepare(`
      SELECT data 
      FROM messages 
      WHERE id = ?
  `);
  const message = stmt.get(id) as { data: string } | undefined;

  return message
    ? WAProto.WebMessageInfo.fromObject(JSON.parse(message.data) as { [k: string]: unknown })
    : null;
}

export function saveContact(contact: {
  jid: string;
  pushName?: string | null | undefined;
  verifiedName?: string | null | undefined;
  lid?: string | null | undefined;
  bio?: string | null | undefined;
}): void {
  ContactStore();
  const db = getDb();
  const stmt: Statement = db.prepare(`
    INSERT OR REPLACE INTO contacts (
      jid,
      pushName,
      verifiedName,
      lid,
      bio
    ) VALUES (?, ?, ?, ?, ?)
  `);

  const params = [
    contact.jid,
    contact.pushName ?? null,
    contact.verifiedName ?? null,
    contact.lid ?? null,
    contact.bio ?? null,
  ];

  stmt.run(params);
}
