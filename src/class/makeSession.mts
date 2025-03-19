import { Boom } from '@hapi/boom/lib/index.js';
import { fetchJson } from '../index.mts';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createDecipheriv } from 'node:crypto';
import { join } from 'node:path';

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
}
