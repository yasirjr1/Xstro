import type { Serialize } from '../../types/index.ts';
import type { WASocket, WAMessageKey, WAMessage } from 'baileys';
import { downloadMediaMessage } from 'baileys';
import { isMediaMessage } from '../../utils/index.ts';

export default class Base {
 public client: WASocket;
 public data: Serialize;
 public jid: string;
 public id: string | null | undefined;
 public fromMe: boolean | null | undefined;
 public participant: string | null | undefined;
 public key: WAMessageKey;
 public owner: string;
 public sender: string | null | undefined;
 public isGroup: boolean | undefined;
 public sudo: boolean;
 public mode: boolean;
 public user: (match?: string) => string | undefined;
 public prefix: string[];

 constructor(data: Serialize, client: WASocket) {
  this.client = client;
  this.data = data;
  this.jid = data.jid;
  this.id = data.key.id;
  this.fromMe = data.key.fromMe;
  this.participant = data.key.participant;
  this.key = data.key;
  this.owner = data.owner;
  this.sender = data.sender;
  this.isGroup = data.isGroup;
  this.sudo = data.sudo;
  this.mode = data.mode;
  this.user = data.user;
  this.prefix = data.prefix;
 }

 async edit(text: string, jid: string, key: WAMessageKey) {
  return await this.client.sendMessage(jid, { text, edit: key });
 }

 async delete(jid: string, key: WAMessageKey) {
  const isRestrictedGroup = this.isGroup && !(await this.isBotAdmin());
  const isPrivateNotMe = !this.isGroup && !this.fromMe;

  if (isRestrictedGroup || isPrivateNotMe) {
   return await this.client.chatModify(
    {
     deleteForMe: {
      deleteMedia: isMediaMessage(this.data),
      key: key,
      timestamp: Date.now(),
     },
    },
    jid,
   );
  }
  return await this.client.sendMessage(jid, { delete: key });
 }

 async downloadM(message: WAMessage) {
  return await downloadMediaMessage(message, 'buffer', {});
 }

 async isAdmin() {
  const metadata = await this.client.groupMetadata(this.jid);
  const allAdmins = metadata.participants
   .filter((v) => v.admin !== null)
   .map((v) => v.id);
  return !Array.isArray(allAdmins)
   ? Array.from(allAdmins)
   : allAdmins.includes(this.sender ?? '');
 }

 async isBotAdmin() {
  const metadata = await this.client.groupMetadata(this.jid);
  const allAdmins = metadata.participants
   .filter((v) => v.admin !== null)
   .map((v) => v.id);
  return !Array.isArray(allAdmins)
   ? Array.from(allAdmins)
   : allAdmins.includes(this.owner);
 }

 async forward(jid: string) {
  if (this.data.message) {
   return await this.client.sendMessage(jid, {
    forward: { key: this.key, message: this.data.message },
    contextInfo: { isForwarded: false, forwardingScore: 0 },
   });
  }
 }

 async react(emoji: string, jid: string, key: WAMessageKey) {
  return await this.client.sendMessage(jid, { react: { text: emoji, key } });
 }
}
