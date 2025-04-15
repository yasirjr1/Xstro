import Base from './Base.ts';
import type { Serialize } from '../../types/index.ts';
import type { WASocket } from 'baileys';

export default class ReplyMessage extends Base {
 public message: Serialize['message'];
 public mtype: Serialize['mtype'];
 public text: Serialize['text'];
 public broadcast: boolean | undefined;
 public image: boolean;
 public video: boolean;
 public audio: boolean;
 public sticker: boolean;
 public viewOnce: boolean | undefined;

 constructor(data: Serialize, client: WASocket) {
  super(data, client);
  this.message = data.quoted?.message;
  this.mtype = data.quoted?.type;
  this.text = data.quoted?.text;
  this.broadcast = data.quoted?.broadcast;
  this.image = Boolean(data?.quoted?.message?.imageMessage);
  this.video = Boolean(data?.quoted?.message?.videoMessage);
  this.audio = Boolean(data?.quoted?.message?.audioMessage);
  this.sticker = Boolean(data?.quoted?.message?.stickerMessage);
  this.viewOnce = data?.quoted?.viewOnce;
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
