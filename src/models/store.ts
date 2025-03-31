import { type WAMessage, type WAMessageContent, type WAMessageKey, WAProto } from 'baileys';
import database from '../core/database.js';

const messageDb = database.define(
  'messages',
  {
    id: { type: 'STRING', allowNull: false, primaryKey: true },
    message: { type: 'STRING', allowNull: true },
  },
  { freezeTableName: true },
);

export async function saveMessage(message: WAMessage) {
  await messageDb.create({ id: message.key.id, message: message });
}

export async function getMessage(key: WAMessageKey): Promise<WAMessageContent | undefined> {
  if (!key.id) return undefined;
  const m = (await messageDb.findOne({ where: { id: key.id } })) as
    | {
        id: string;
        message: WAMessage;
      }
    | undefined;
  return m?.message ? WAProto.Message.fromObject(m.message) : undefined;
}
