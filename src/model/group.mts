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

async function Antiword(): Promise<void> {
  const db = await getDb();
  db.exec(`
        CREATE TABLE IF NOT EXISTS antiword (
            id TEXT PRIMARY KEY,
            status INTEGER CHECK (status IN (0, 1)),
            words TEXT
        )
    `);
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

export async function setAntiword(
  id: string,
  status: number,
  words: string[],
): Promise<{ success: boolean; added: number }> {
  await Antiword();
  const db = await getDb();
  const stmtGet: Statement = db.prepare('SELECT words FROM antiword WHERE id = ?');
  const existing = stmtGet.get(id) as { words: string } | undefined;
  const existingWords = existing?.words ? JSON.parse(existing.words) : [];
  const uniqueWords = [...new Set([...existingWords, ...words])];
  const added = uniqueWords.length - existingWords.length;

  const stmtRun: Statement = db.prepare(
    'INSERT OR REPLACE INTO antiword (id, status, words) VALUES (?, ?, ?)',
  );
  stmtRun.run([id, status, JSON.stringify(uniqueWords)]);

  return { success: true, added };
}

export async function delAntiword(id: string): Promise<boolean> {
  await Antiword();
  const db = await getDb();
  const stmt: Statement = db.prepare('DELETE FROM antiword WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export async function getAntiword(
  id: string,
): Promise<{ status: boolean; words: string[] } | null> {
  await Antiword();
  const db = await getDb();
  const stmt: Statement = db.prepare('SELECT status, words FROM antiword WHERE id = ?');
  const result = stmt.get(id) as { status: number; words: string } | undefined;
  if (!result) return null;
  return { status: Boolean(result.status), words: JSON.parse(result.words) };
}
