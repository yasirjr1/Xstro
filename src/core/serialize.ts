import type { WASocket, WAMessage } from 'baileys';
import { getSettings, getSudo } from '../models/index.ts';
import { parseJid } from '../utils/index.ts';
import { Message, ReplyMessage } from './class/index.ts';

export async function serialize(client: WASocket, msg: WAMessage) {
  const { prefix, mode } = await getSettings();
  const owner = parseJid(client?.user?.id);
  const sender = msg.key.fromMe ? owner : msg.key.participant || msg.key.remoteJid;
  const sudo = (await getSudo())?.includes(sender ?? '') || sender === owner;

  return msg ?
      new Message(client, msg, { prefix, mode }, sudo)
    : new ReplyMessage(client, msg, { prefix, mode }, sudo);
}
