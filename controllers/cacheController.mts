import { Boom } from '@hapi/boom';
import { getDb } from '../src/model/database.mts';
import type { Database } from 'better-sqlite3';
import type { Statement } from 'better-sqlite3';
import type { WASocket, GroupMetadata } from 'baileys';

export class GroupCache {
  private client: WASocket;
  private db: Database;
  private intervalId?: NodeJS.Timeout;
  private readonly INTERVAL_MS = 300 * 1000;

  constructor(client: WASocket) {
    this.client = client;
    this.initDb();
  }

  private async initDb(): Promise<void> {
    this.db = await getDb();
  }

  public async start(): Promise<void> {
    if (this.intervalId) return;

    await this.initDb();

    this.intervalId = setInterval(async () => {
      if (!this.client?.user?.id) return;
      try {
        await this.makeMDB();
        const groups = await this.client.groupFetchAllParticipating();

        for (const [id, metadata] of Object.entries(groups)) {
          await this.saveData(id, metadata);
        }
      } catch (error) {
        throw new Boom((error as Error).message);
      }
    }, this.INTERVAL_MS);
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private async makeMDB(): Promise<void> {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS group_metadata (
        jid TEXT PRIMARY KEY,
        metadata JSON
      );
    `);
  }

  private async saveData(jid: string, metadata: GroupMetadata): Promise<void> {
    const jsonMetadata = JSON.stringify(metadata);
    const stmt: Statement = this.db.prepare(`
      INSERT INTO group_metadata (jid, metadata)
      VALUES (?, ?)
      ON CONFLICT(jid) DO UPDATE SET metadata = excluded.metadata;
    `);
    stmt.run(jid, jsonMetadata);
  }
}
