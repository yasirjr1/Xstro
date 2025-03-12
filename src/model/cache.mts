import type { DatabaseSync, StatementSync } from 'node:sqlite';
import type { GroupMetadata } from 'baileys';
import { getDb } from './database.mts';

export function GroupMetaCache(): void {
  const db: DatabaseSync = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS group_metadata (
      jid TEXT PRIMARY KEY,
      metadata JSON
    );
  `);
}

export const groupSave = (jid: string, metadata: GroupMetadata): void => {
  const db: DatabaseSync = getDb();

  const jsonMetadata = JSON.stringify(metadata);
  const stmt: StatementSync = db.prepare(`
    INSERT INTO group_metadata (jid, metadata)
    VALUES (?, ?)
    ON CONFLICT(jid) DO UPDATE SET metadata = excluded.metadata;
  `);

  stmt.run(jid, jsonMetadata);
};

export const groupMetadata = (jid: string): GroupMetadata | undefined => {
  const db: DatabaseSync = getDb();

  const stmt: StatementSync = db.prepare(`SELECT metadata FROM group_metadata WHERE jid = ?;`);
  const result = stmt.get(jid) as { metadata: string } | undefined;

  return result && result.metadata ? JSON.parse(result.metadata) : undefined;
};
