import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { DatabaseSync } from 'node:sqlite';
import { BufferJSON, WAProto } from 'baileys';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function cfaSqliteMigrator(location: string, databasePath: string) {
  const db = new DatabaseSync(databasePath);

  // Create session table if not exists
  db.exec(`
        CREATE TABLE IF NOT EXISTS session (
            name TEXT NOT NULL,
            id TEXT NOT NULL,
            value TEXT NOT NULL,
            PRIMARY KEY (name, id)
        ) WITHOUT ROWID;
    `);

  // Enable WAL mode for better performance during migration
  db.exec('PRAGMA journal_mode = WAL;');

  const files = await readdir(location);
  const insertStmt = db.prepare(
    'INSERT OR REPLACE INTO session (name, id, value) VALUES (?, ?, ?)',
  );

  db.exec('BEGIN TRANSACTION');
  try {
    for (const file of files) {
      try {
        const filePath = join(location, file);
        const content = await readFile(filePath, 'utf-8');

        if (file === 'creds.json') {
          /** Main creds */
          const creds = JSON.parse(content, BufferJSON.reviver);
          insertStmt.run('creds', 'default', JSON.stringify(creds, BufferJSON.replacer));
        } else {
          // Parse key files
          const [type, ...idParts] = file.replace(/\.json$/, '').split('-');

          if (!type || idParts.length === 0) {
            console.warn(`Skipping invalid file: ${file}`);
            continue;
          }

          const id = idParts.join('-');
          let value = JSON.parse(content, BufferJSON.reviver);

          /** App state keys data */
          if (type === 'app-state-sync-key' && value) {
            value = WAProto.Message.AppStateSyncKeyData.fromObject(value);
          }

          insertStmt.run(type, id, JSON.stringify(value, BufferJSON.replacer));
        }
      } catch (error) {
        console.error(`Failed to process ${file}:`, error);
        throw error;
      }
    }

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  } finally {
    db.close();
  }
  return;
}
