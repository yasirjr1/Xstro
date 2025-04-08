import { logger } from '../utils/index.ts';
import database from '../core/database.ts';
import {
  WAProto,
  BufferJSON,
  initAuthCreds,
  type SignalDataTypeMap,
  type AuthenticationCreds,
} from 'baileys';

export const authstate = database.define(
  'auth',
  {
    name: { type: 'STRING', allowNull: true, primaryKey: true },
    data: { type: 'STRING', allowNull: true },
  },
  { freezeTableName: true },
);

export const useSqliteAuthStore = async () => {
  const writeData = async (name: string, data: unknown): Promise<void> => {
    const existing = await authstate.findOne({ where: { name } });
    if (existing) {
      await authstate.update({ data: data }, { where: { name } });
    } else {
      await authstate.create({ name, data: data });
    }
  };

  const readData = async (name: string) => {
    try {
      const entry = (await authstate.findOne({ where: { name } })) as { data: string };
      return entry?.data ? JSON.parse(entry.data, BufferJSON.reviver) : null;
    } catch (error) {
      logger.error(error);
      return null;
    }
  };

  const removeData = async (name: string): Promise<void> => {
    try {
      await authstate.destroy({ where: { name } });
    } catch (error) {
      logger.error(error);
    }
  };

  const creds: AuthenticationCreds = (await readData('creds')) || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async <T extends keyof SignalDataTypeMap>(
          type: T,
          ids: string[],
        ): Promise<{ [id: string]: SignalDataTypeMap[T] }> => {
          const data: { [id: string]: SignalDataTypeMap[T] } = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(`${type}-${id}`);
              if (type === 'app-state-sync-key' && value) {
                value = WAProto.Message.AppStateSyncKeyData.fromObject(value);
              }
              data[id] = value;
            }),
          );
          return data;
        },
        set: async (data: { [category: string]: { [id: string]: any } }) => {
          const tasks: Promise<void>[] = [];
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const name = `${category}-${id}`;
              tasks.push(value ? writeData(name, value) : removeData(name));
            }
          }
          await Promise.all(tasks);
        },
      },
    },
    saveCreds: async () => {
      await writeData('creds', creds);
    },
  };
};
