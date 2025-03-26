import fs from 'fs/promises';
import { logger } from '../client.mts';
import { MakeSession } from '../../controllers/index.mts';
import { environment } from '../../config.ts';
import { getDb } from '../model/database.mts';

const sessionId = environment.SESSION;
const server = environment.SESSION_URL;

export const getSession = async (): Promise<void | {
  creds: string;
  syncKeys: string;
}> => {
  if (!sessionId) return console.log('No session provided');
  if (!server) console.log('Session found, no custom server found!, using default...');

  const db = await getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      sessionId TEXT PRIMARY KEY,
      data TEXT
    )
  `);

  const getSessionStmt = db.prepare('SELECT sessionId FROM sessions LIMIT 1');
  const existingSession = getSessionStmt.get() as { sessionId: string } | undefined;

  if (!existingSession || existingSession.sessionId !== sessionId) {
    const cipher = new MakeSession(
      sessionId,
      server || 'https://session.koyeb.app/session?session=',
    );

    const IDR = await cipher.fetchCipherSession();
    cipher.decodeAndSaveCipher(IDR);
    await cipher.migrateSessionSqlite('./session');

    const deleteStmt = db.prepare('DELETE FROM sessions');
    deleteStmt.run();

    const insertSessionStmt = db.prepare('INSERT INTO sessions (sessionId, data) VALUES (?, ?)');
    insertSessionStmt.run(sessionId, JSON.stringify({ lastUpdated: new Date().toISOString() }));
    await fs.rm('./session', { recursive: true, force: true });
    return logger.info('Session Initialized with new session ID');
  } else {
    return logger.info('Using existing session');
  }
};
