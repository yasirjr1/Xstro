import Base from './Base.ts';
import ReplyMessage from './ReplyMessage.ts';
import type { Serialize, MessageMisc } from '../../types/index.ts';
import type { WASocket, AnyMessageContent } from 'baileys';
import { prepareMessage } from '../../utils/index.ts';

export default class Message extends Base {
 public quoted?: ReplyMessage;

 constructor(data: Serialize, client: WASocket) {
  super(data, client);
  this.quoted = data.quoted ? new ReplyMessage(data, this.client) : undefined;
 }

 async send(
  content: string | Buffer,
  options?: MessageMisc & Partial<AnyMessageContent>,
 ) {
  const jid = options?.jid ?? this.jid;
  const updatedOptions = { ...options, jid };
  const msg = await prepareMessage(this.client, content, updatedOptions);
  return new Message(
   await (await import('../serialize.ts')).serialize(this.client, msg!),
   this.client,
  );
 }

 async edit(text: string) {
  return await super.edit(text, this.jid, this.key);
 }

 async delete() {
  return await super.delete(this.jid, this.key);
 }

 async downloadM() {
  return await super.downloadM(this.data);
 }

 async isAdmin() {
  return await super.isAdmin();
 }

 async isBotAdmin() {
  return await super.isBotAdmin();
 }

 async forward(jid: string) {
  return await super.forward(jid);
 }

 async react(emoji: string) {
  return await super.react(emoji, this.jid, this.key);
 }
}
