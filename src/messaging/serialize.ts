import { isJidGroup, normalizeMessageContent } from 'baileys';
import { getSettings, getSudo } from '../models/index.ts';
import {
 getMessageContent,
 getQuotedContent,
 parseJid,
} from '../utils/index.ts';
import type { WAMessage, WASocket } from 'baileys';

export async function serialize(client: WASocket, WAMessage: WAMessage) {
 const normalizedMessages = {
  ...WAMessage,
  message: normalizeMessageContent(WAMessage?.message),
 };
 const { key, message, broadcast, ...messages } = normalizedMessages;
 const { prefix, mode } = await getSettings();
 const owner = parseJid(client?.user?.id);
 const sender =
  isJidGroup(key.remoteJid!) || broadcast
   ? key.participant
   : key.fromMe
     ? owner
     : key.remoteJid;

 const msgContent = getMessageContent(message);
 const quotedM = getQuotedContent(message, key, owner);

 return {
  key,
  jid: key.remoteJid ?? '',
  isGroup: isJidGroup(key.remoteJid!),
  owner,
  prefix,
  sender,
  mode,
  sudo: (await getSudo())?.includes(sender ?? '') || sender === owner,
  ...msgContent,
  ...messages,
  quoted: quotedM ? { ...quotedM } : undefined,
  user: function (match?: string): string | undefined {
   if (this.isGroup) {
    if (quotedM && quotedM.sender) return quotedM.sender;
    if (!match) return undefined;
    return Array.isArray(match) ? parseJid(match[0]) : parseJid(match);
   } else {
    if (quotedM && quotedM.sender) return quotedM.sender;
    if (!match) return undefined;
    return Array.isArray(match) ? parseJid(match[0]) : parseJid(match);
   }
  },
 };
}
