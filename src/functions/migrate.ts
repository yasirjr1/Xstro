import { createDecipheriv } from 'node:crypto';
import config from '../../config.ts';
import database from '../core/database.ts';
import { authstate } from './storage.ts';
import { fetchJson, logger } from '../utils/index.ts';

const sessionId = database.define(
  'sessionId',
  {
    session: { type: 'STRING', allowNull: true, primaryKey: true },
  },
  { freezeTableName: true },
);

const isSessionSame = async (session: string): Promise<boolean> => {
  const currentSession = (await sessionId.findByPk(session)) as { session: string };
  if (!currentSession) return false;

  if (currentSession) {
    JSON.parse(JSON.stringify(currentSession));
    if (currentSession.session === session) return true;
  }
  return false;
};

const fetchSession = async () => {
  try {
    const encryption = await fetchJson(
      `https://session.koyeb.app/session?session=${config.SESSION}`,
    );
    const session = JSON.parse(encryption);
    const cipher = JSON.parse(session.data);
    return cipher as { key: string; iv: string; data: string };
  } catch (error) {
    logger.error(error);
  }
};

const decryptSession = async (data: { key: string; iv: string; data: string }) => {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(data.key, 'hex');
  const iv = Buffer.from(data.iv, 'hex');
  const decipher = createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(data.data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  const res: { creds: { [key: string]: any }; syncKeys: { [key: string]: string } } =
    JSON.parse(decrypted);
  return res;
};

const transferToDb = async (data: {
  creds: { [key: string]: any };
  syncKeys: { [key: string]: string };
}) => {
  const creds = Object.keys(data)[0];
  const AppStateSyncKeyDataNames = Object.keys(data.syncKeys).map((appKeys) =>
    appKeys.replace('.json', ''),
  );
  const AppStateSyncKeyDataValues = Object.values(data.syncKeys);
  const names = [creds, ...AppStateSyncKeyDataNames];
  const values = [data.creds, ...AppStateSyncKeyDataValues];
  const merged = Object.fromEntries(names.map((key, index) => [key, values[index]]));

  for (const [name, dataValue] of Object.entries(merged)) {
    await authstate.create({ name, data: dataValue });
  }
  return await sessionId.create({ session: config.SESSION });
};

export async function initSession(): Promise<unknown> {
  if (!config.SESSION) throw new Error('No session Id found!');
  if (await isSessionSame(config.SESSION)) return console.info('Session Loaded!');
  const data = await fetchSession();
  if (!data) throw new Error('Session no longer exists on server!');
  const decrypted = await decryptSession(data);
  return await transferToDb(decrypted);
}
