import Base from './Base.ts';
import { isMediaMessage } from '../../utils/content.ts';
import type { Serialize } from '../../@types';
import {
  downloadMediaMessage,
  type WAMessage,
  type WAContextInfo,
  type WASocket,
  type WAMessageKey,
} from 'baileys';

export default class ReplyMessage extends Base {
  public jid: Serialize['jid'];
  public key: WAMessageKey;
  public message: Serialize['message'];
  public mtype: Serialize['mtype'];
  public text: Serialize['text'];
  public quoted: Serialize['quoted'];

  constructor(data: Serialize, client: WASocket) {
    super(data, client);
    this.jid = data.jid;
    this.key = data.quoted?.key as WAMessageKey;
    this.message = data.quoted?.message;
    this.mtype = data.quoted?.type;
    this.text = data.text;
    this.quoted = data.quoted;
  }

  async forward(
    jid: string,
    opts?: { quoted?: WAMessage; contextInfo?: WAContextInfo },
  ): Promise<WAMessage | undefined> {
    return await this.client.sendMessage(
      jid,
      {
        forward: this.quoted!,
        ...opts,
        contextInfo: { isForwarded: false, forwardingScore: 0, ...opts },
      },
      { ...opts },
    );
  }

  async react(emoji: string): Promise<WAMessage | undefined> {
    return await this.client.sendMessage(this.jid, {
      react: { text: emoji, key: this.quoted?.key },
    });
  }

  async edit(text: string, key?: WAMessageKey): Promise<WAMessage | undefined> {
    return await this.client.sendMessage(this.jid, {
      text,
      edit: key || this.key,
    });
  }

  async downloadM(message: WAMessage = { key: this.key, message: this.message } as WAMessage) {
    return await downloadMediaMessage(message, 'buffer', {});
  }

  async delete(
    message: WAMessage = { key: this.data.key, message: this.message } as WAMessage,
  ): Promise<void | WAMessage> {
    if (
      (this.data.isGroup && !(await this.isBotAdmin())) ||
      (!this.data.isGroup && !message?.key.fromMe)
    ) {
      return this.client.chatModify(
        {
          deleteForMe: {
            deleteMedia: await isMediaMessage(message),
            key: message.key,
            timestamp: Date.now(),
          },
        },
        this.data.jid,
      );
    }
    return await this.client.sendMessage(this.data.jid, { delete: message.key });
  }
}
