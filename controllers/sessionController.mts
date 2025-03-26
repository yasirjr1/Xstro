import { Boom } from '@hapi/boom';
import { fetchJson } from '../src/index.mts';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createDecipheriv } from 'node:crypto';
import { join } from 'node:path';
import { promises as fs } from 'fs';
import path from 'path';
import { getDb } from '../src/model/database.mts';

export class MakeSession {
  private sessionId: string;
  private server: string;

  /**
   *
   * @param sessionId - Unique session id
   * @param server - Postgre server where the session ciphered data was saved
   */
  constructor(sessionId: string, server: string) {
    this.sessionId = sessionId;
    this.server = server;
  }
  /**
   * Starting method for fetch the cipher session from our postgre server
   */
  async fetchCipherSession(): Promise<{ key: string; iv: string; data: string }> {
    try {
      console.log(`${this.server}${this.sessionId}`);
      const encryption = await fetchJson(`${this.server}${this.sessionId}`);
      const session = JSON.parse(encryption);
      const cipher = JSON.parse(session.data);
      return cipher;
    } catch (error) {
      throw new Boom(error.message as Error);
    }
  }

  /**
   * Decodes the Session cipher and saves all the data to a folder, where it can be migrated to sqlite
   */
  decodeAndSaveCipher(
    cipher: { key: string; iv: string; data: string },
    saveTo: string = './session',
  ): {
    creds: string;
    syncKeys: string;
  } {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(cipher.key, 'hex');
    const iv = Buffer.from(cipher.iv, 'hex');
    const decipher = createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(cipher.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    const data: { creds: string; syncKeys: string } = JSON.parse(decrypted);
    mkdirSync(saveTo, { recursive: true });
    writeFileSync(join(saveTo, 'creds.json'), JSON.stringify(data.creds));
    for (const [filename, syncKeyData] of Object.entries(data.syncKeys)) {
      writeFileSync(join(saveTo, filename), JSON.stringify(syncKeyData));
    }
    return data;
  }

  async migrateSessionSqlite(sessionPath: string): Promise<void> {
    const db = await getDb();

    try {
      db.exec(`
            CREATE TABLE IF NOT EXISTS session (
                name TEXT,
                id TEXT,
                value TEXT,
                UNIQUE(name, id)
            )
        `);

      const insert = db.prepare('INSERT OR IGNORE INTO session (name, id, value) VALUES (?, ?, ?)');
      const seen = new Set<string>();

      const files = await fs.readdir(sessionPath);

      for (const fileName of files) {
        if (!fileName.endsWith('.json')) continue;

        const baseName = fileName.replace('.json', '');
        const fullPath = path.join(sessionPath, fileName);
        const fileContent = await fs.readFile(fullPath, 'utf-8');
        JSON.parse(fileContent);

        let name = '';
        let id = '';

        if (baseName === 'creds') {
          name = 'creds';
          id = 'default';
        } else {
          const parts = baseName.split('-');

          if (parts[0] === 'app' && parts[1] === 'state' && parts[2] === 'sync') {
            if (parts[3] === 'key' && parts.length > 4) {
              name = 'app-state-sync-key';
              id = parts[4];
            } else if (parts[3] === 'version') {
              name = 'app-state-sync-version';
              id = parts[4];
            } else {
              name = parts[3];
              id = parts.length > 4 ? parts[4] : 'default';
            }
          }
        }

        const key = `${name}:${id}`;
        if (!seen.has(key)) {
          seen.add(key);
          insert.run(name, id, fileContent);
        }
      }
    } catch (error) {
      throw new Error(error);
    }
  }
}
