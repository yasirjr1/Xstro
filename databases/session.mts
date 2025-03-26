import { type Database, type Statement } from 'better-sqlite3';
import type { AuthenticationCreds, AuthenticationState, SignalDataTypeMap } from 'baileys';
import { initAuthCreds, BufferJSON, WAProto as proto } from 'baileys';

export const useSqliteAuthState = async (
  database: Database,
): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }> => {
  database.exec(`
    CREATE TABLE IF NOT EXISTS session (
      name TEXT NOT NULL,
      id TEXT NOT NULL,
      value TEXT NOT NULL,
      PRIMARY KEY (name, id)
    ) WITHOUT ROWID;
  `);

  database.exec('PRAGMA journal_mode = WAL;');
  database.exec('PRAGMA synchronous = OFF;'); // Maximum write speed, minimal durability
  database.exec('PRAGMA cache_size = -100000;'); // 40MB cache
  database.exec('PRAGMA temp_store = MEMORY;'); // Temp tables in RAM
  database.exec('PRAGMA mmap_size = 536870912;'); // 512MB memory mapping

  let creds: AuthenticationCreds;
  const credsStmt: Statement = database.prepare(
    'SELECT value FROM session WHERE name = ? AND id = ?',
  );
  const credsRow = credsStmt.get('creds', 'default') as { value: string } | undefined;

  if (credsRow) {
    creds = JSON.parse(credsRow.value, BufferJSON.reviver) as AuthenticationCreds;
  } else {
    creds = initAuthCreds();
    const insertCreds: Statement = database.prepare(
      'INSERT INTO session (name, id, value) VALUES (?, ?, ?)',
    );
    insertCreds.run('creds', 'default', JSON.stringify(creds, BufferJSON.replacer));
  }

  return {
    state: {
      creds,
      keys: {
        get: async <T extends keyof SignalDataTypeMap>(
          type: T,
          ids: string[],
        ): Promise<{
          [id: string]: SignalDataTypeMap[T];
        }> => {
          const data: { [id: string]: SignalDataTypeMap[T] } = {};
          const stmt: Statement = database.prepare(
            `SELECT id, value FROM session WHERE name = ? AND id IN (${ids.map(() => '?').join(',')})`,
          );
          const rows = stmt.all(type, ...ids) as Array<{ id: string; value: string }>;

          for (const row of rows) {
            let value = JSON.parse(row.value, BufferJSON.reviver);
            if (type === 'app-state-sync-key' && value) {
              value = proto.Message.AppStateSyncKeyData.fromObject(value);
            }
            data[row.id] = value;
          }
          return data;
        },
        set: async (data: {
          [key: string]: { [id: string]: SignalDataTypeMap[keyof SignalDataTypeMap] | null };
        }): Promise<void> => {
          database.exec('BEGIN TRANSACTION');
          try {
            const insertStmt: Statement = database.prepare(
              'INSERT OR REPLACE INTO session (name, id, value) VALUES (?, ?, ?)',
            );
            const deleteStmt: Statement = database.prepare(
              'DELETE FROM session WHERE name = ? AND id = ?',
            );

            for (const category of Object.keys(data)) {
              for (const id of Object.keys(data[category])) {
                const value = data[category][id];
                if (value) {
                  insertStmt.run(category, id, JSON.stringify(value, BufferJSON.replacer));
                } else {
                  deleteStmt.run(category, id);
                }
              }
            }
            database.exec('COMMIT');
          } catch (error) {
            database.exec('ROLLBACK');
            throw error;
          }
        },
      },
    },
    saveCreds: async (): Promise<void> => {
      const stmt: Statement = database.prepare(
        'INSERT OR REPLACE INTO session (name, id, value) VALUES (?, ?, ?)',
      );
      stmt.run('creds', 'default', JSON.stringify(creds, BufferJSON.replacer));
    },
  };
};
