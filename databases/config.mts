import { getDb } from '../src/database.mts';
import type { Statement } from 'better-sqlite3';
import type { Config } from '../Types/index.mts';

async function ConfigDB(): Promise<void> {
  const db = await getDb();
  db.exec(`
        CREATE TABLE IF NOT EXISTS config (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT NOT NULL,
            value TEXT NOT NULL,
            UNIQUE(key)
        )
    `);

  const stmtCheck: Statement = db.prepare('SELECT id FROM config LIMIT 1');
  const exists = stmtCheck.get() as { id: number } | undefined;
  if (!exists) {
    const defaultConfig = [
      { key: 'prefix', value: '.' },
      { key: 'mode', value: '1' },
      { key: 'autoRead', value: '0' },
      { key: 'autoStatusRead', value: '0' },
      { key: 'autolikestatus', value: '0' },
      { key: 'disablegc', value: '0' },
      { key: 'disabledm', value: '0' },
      { key: 'cmdReact', value: '1' },
      { key: 'cmdRead', value: '0' },
      { key: 'savebroadcast', value: '0' },
      { key: 'disabledCmds', value: '[]' },
      { key: 'sudo', value: '[]' },
      { key: 'banned', value: '[]' },
    ];

    const stmtInsert: Statement = db.prepare('INSERT INTO config (key, value) VALUES (?, ?)');
    const transaction = db.transaction((configs) => {
      for (const config of configs) {
        stmtInsert.run([config.key, config.value]);
      }
    });
    transaction(defaultConfig);
  }
}

export async function getConfig(): Promise<Config> {
  const db = await getDb();
  await ConfigDB();

  const stmt: Statement = db.prepare('SELECT key, value FROM config');
  const rows = stmt.all() as { key: string; value: string }[];
  const configMap = Object.fromEntries(rows.map((row) => [row.key, row.value]));

  return {
    prefix: Array.from(configMap.prefix) || '.',
    mode: Boolean(parseInt(configMap.mode || '1')),
    autoRead: Boolean(parseInt(configMap.autoRead || '0')),
    autoStatusRead: Boolean(parseInt(configMap.autoStatusRead || '0')),
    autolikestatus: Boolean(parseInt(configMap.autolikestatus || '0')),
    disablegc: Boolean(parseInt(configMap.disablegc || '0')),
    disabledm: Boolean(parseInt(configMap.disabledm || '0')),
    cmdReact: Boolean(parseInt(configMap.cmdReact || '1')),
    cmdRead: Boolean(parseInt(configMap.cmdRead || '0')),
    savebroadcast: Boolean(parseInt(configMap.savebroadcast || '0')),
    disabledCmds: JSON.parse(configMap.disabledCmds || '[]'),
    sudo: JSON.parse(configMap.sudo || '[]'),
    banned: JSON.parse(configMap.banned || '[]'),
  };
}

export async function editConfig(updates: Partial<Config>): Promise<Config | null> {
  const db = await getDb();
  await ConfigDB();

  const allowedKeys: (keyof Config)[] = [
    'prefix',
    'mode',
    'autoRead',
    'autoStatusRead',
    'autolikestatus',
    'disablegc',
    'disabledm',
    'cmdReact',
    'cmdRead',
    'savebroadcast',
    'disabledCmds',
    'sudo',
    'banned',
  ];

  const keys = Object.keys(updates).filter((key) => allowedKeys.includes(key as keyof Config));
  if (!keys.length) return null;

  const stmt: Statement = db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)');
  const transaction = db.transaction((updateKeys) => {
    for (const key of updateKeys) {
      const value = updates[key as keyof Config];
      let dbValue: string;

      if (typeof value === 'boolean') {
        dbValue = value ? '1' : '0';
      } else if (Array.isArray(value)) {
        dbValue = JSON.stringify(value);
      } else {
        dbValue = String(value);
      }

      stmt.run([key, dbValue]);
    }
  });

  transaction(keys);
  return await getConfig();
}
