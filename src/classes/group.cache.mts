import type { WASocket, GroupMetadata } from 'baileys';
import type { DatabaseSync, StatementSync } from 'node:sqlite';
import { Boom } from '@hapi/boom';
import { getDb } from '../model/database.mts';

export class GroupSync {
  private client: WASocket;
  private db: DatabaseSync;
  private intervalId?: NodeJS.Timeout;
  private readonly INTERVAL_MS = 300 * 1000; // 5 minutes in milliseconds

  constructor(client: WASocket) {
    this.client = client;
    this.db = getDb();
  }

  public start(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(async () => {
      try {
        this.makeMDB();
        const groups = await this.client.groupFetchAllParticipating();

        for (const [id, metadata] of Object.entries(groups)) {
          this.saveData(id, metadata);
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

  private makeMDB(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS group_metadata (
        jid TEXT PRIMARY KEY,
        metadata JSON
      );
    `);
  }

  private saveData(jid: string, metadata: GroupMetadata): void {
    const jsonMetadata = JSON.stringify(metadata);
    const stmt: StatementSync = this.db.prepare(`
      INSERT INTO group_metadata (jid, metadata)
      VALUES (?, ?)
      ON CONFLICT(jid) DO UPDATE SET metadata = excluded.metadata;
    `);
    stmt.run(jid, jsonMetadata);
  }
}
