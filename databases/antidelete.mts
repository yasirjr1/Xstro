import { getDb } from '../src/database.mts';

async function Antidelete(): Promise<void> {
  const db = await getDb();
  db.exec(`CREATE TABLE IF NOT EXISTS antidelete (
        jid TEXT PRIMARY KEY,
        status INTEGER NOT NULL DEFAULT 0
    )`);
  db.exec(`CREATE TABLE IF NOT EXISTS antidelete_dm (
        id INTEGER PRIMARY KEY CHECK(id = 1),
        dmstatus INTEGER NOT NULL DEFAULT 0,
        CONSTRAINT single_row CHECK (id = 1)
    )`);
  db.exec(`INSERT OR IGNORE INTO antidelete_dm (id, dmstatus) VALUES (1, 0)`);
}

async function setAntidelete(jid?: string, status?: 0 | 1, dmstatus?: 0 | 1): Promise<void> {
  await Antidelete();
  const db = await getDb();

  if (jid && status !== undefined) {
    const stmt = db.prepare(`
      INSERT INTO antidelete (jid, status) 
      VALUES (?, ?)
      ON CONFLICT(jid) DO UPDATE SET status = ?
    `);
    stmt.run(jid, status, status);
  }

  if (dmstatus !== undefined) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO antidelete_dm (id, dmstatus) 
      VALUES (1, ?)
    `);
    stmt.run(dmstatus);
  }
}

async function getAntidelete(jid?: string): Promise<boolean> {
  await Antidelete();
  const db = await getDb();

  if (jid) {
    const stmt = db.prepare(`
      SELECT status FROM antidelete 
      WHERE jid = ?
    `);
    const result = stmt.get(jid) as { status: 0 | 1 } | undefined;
    return Boolean(result?.status);
  } else {
    const stmt = db.prepare(`
      SELECT dmstatus FROM antidelete_dm 
      WHERE id = 1
    `);
    const result = stmt.get() as { dmstatus: 0 | 1 } | undefined;
    return Boolean(result?.dmstatus);
  }
}

export { setAntidelete, getAntidelete };
