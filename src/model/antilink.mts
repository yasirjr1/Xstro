import { getDb } from './database.mts';
import type { Statement } from 'better-sqlite3';

async function Antilink(): Promise<void> {
  const db = await getDb();
  db.exec(`CREATE TABLE IF NOT EXISTS antilink (
        id TEXT PRIMARY KEY,
        mode TEXT CHECK(mode IN ('kick', 'delete') OR mode IS NULL),
        status INTEGER NOT NULL DEFAULT 0
    )`);
}

export async function setAntilink(
  id: string,
  status: boolean,
  mode?: 'kick' | 'delete',
): Promise<boolean> {
  await Antilink();
  const db = await getDb();
  const stmt: Statement = db.prepare(
    `INSERT OR REPLACE INTO antilink (id, mode, status) VALUES (?, ?, ?)`,
  );
  stmt.run([id, mode ?? null, status ? 1 : 0]);
  return true;
}

export async function getAntilink(
  id: string,
): Promise<{ mode: 'kick' | 'delete' | null; status: boolean } | null> {
  await Antilink();
  const db = await getDb();
  const stmt: Statement = db.prepare(`SELECT mode, status FROM antilink WHERE id = ?`);
  const result = stmt.get(id) as { mode: 'kick' | 'delete' | null; status: number } | undefined;
  return result ? { mode: result.mode, status: !!result.status } : null;
}

export async function delAntilink(id: string): Promise<boolean> {
  await Antilink();
  const db = await getDb();
  const stmt: Statement = db.prepare(`DELETE FROM antilink WHERE id = ?`);
  const result = stmt.run(id);
  return result.changes > 0;
}
