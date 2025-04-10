import { isMediaMessage } from '../../utils/content.ts';
import type { Serialize } from '../../@types';
import { downloadMediaMessage, type WASocket, type WAMessageKey, type WAMessage } from 'baileys';

export default class ReplyMessage {
  public client: WASocket;
  public jid: string;
  public key: WAMessageKey;
  public message: Serialize['message'];
  public mtype: Serialize['mtype'];
  public text: Serialize['text'];
  public sender: Serialize['sender'];
  public isGroup: Serialize['isGroup'];
  public owner: Serialize['owner'];
  public broadcast: boolean | undefined;
  public image: boolean;
  public video: boolean;
  public audio: boolean;
  public sticker: boolean;
  public viewOnce: boolean | undefined;

  constructor(data: Serialize, client: WASocket) {
    this.client = client;
    this.jid = data.jid;
    this.key = data.quoted?.key as WAMessageKey;
    this.message = data.quoted?.message;
    this.mtype = data.quoted?.type;
    this.text = data.quoted?.text;
    this.sender = data.quoted?.sender;
    this.isGroup = data.isGroup;
    this.owner = data.owner;
    this.broadcast = data.quoted?.broadcast;
    this.image = Boolean(data?.quoted?.message?.imageMessage);
    this.video = Boolean(data?.quoted?.message?.videoMessage);
    this.audio = Boolean(data?.quoted?.message?.audioMessage);
    this.sticker = Boolean(data?.quoted?.message?.stickerMessage);
    this.viewOnce = data?.quoted?.viewOnce;
  }

  async forward(jid: string) {
    if (this.message) {
      return await this.client.sendMessage(jid, {
        forward: { key: this.key, message: this.message },
        contextInfo: { isForwarded: false, forwardingScore: 0 },
      });
    }
  }

  async edit(text: string) {
    return await this.client.sendMessage(this.jid, {
      text,
      edit: this.key,
    });
  }

  async react(emoji: string) {
    return await this.client.sendMessage(this.jid, {
      react: { text: emoji, key: this.key },
    });
  }

  async delete() {
    const isRestrictedGroup = this.isGroup && !(await this.isBotAdmin());
    const isPrivateNotMe = !this.isGroup && !this.key.fromMe;

    if (isRestrictedGroup || isPrivateNotMe) {
      return await this.client.chatModify(
        {
          deleteForMe: {
            deleteMedia: isMediaMessage({ message: this.message } as WAMessage),
            key: this.key,
            timestamp: Date.now(),
          },
        },
        this.jid,
      );
    }
    return await this.client.sendMessage(this.jid, { delete: this.key });
  }

  async downloadM() {
    if (this.message) {
      return await downloadMediaMessage({ key: this.key, message: this.message }, 'buffer', {});
    }
  }

  async isBotAdmin() {
    const metadata = await this.client.groupMetadata(this.jid);
    const allAdmins = metadata.participants.filter((v) => v.admin !== null).map((v) => v.id);
    return !Array.isArray(allAdmins) ? Array.from(allAdmins) : allAdmins.includes(this.owner);
  }

  async isAdmin() {
    const metadata = await this.client.groupMetadata(this.jid);
    const allAdmins = metadata.participants.filter((v) => v.admin !== null).map((v) => v.id);
    return !Array.isArray(allAdmins)
      ? Array.from(allAdmins)
      : allAdmins.includes(this.sender ?? '');
  }
}
