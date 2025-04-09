import Base from './Base.ts';
import Message from './Message.ts';
import ReplyMessage from './ReplyMessage.ts';
import { isMediaMessage } from '../../utils/content.ts';
import type { Serialize } from '../../@types';
import { downloadMediaMessage, type WAContextInfo, type WAMessage, type WASocket } from 'baileys';

export default class AllMess extends Base {
  public message: Base;

  constructor(data: Serialize, client: WASocket) {
    super(data, client);
    this.message = data.quoted ? new ReplyMessage(data, client) : new Message(data, client);
  }

  async downloadM(message: WAMessage = { key: this.key, message: this.message } as WAMessage) {
    return await downloadMediaMessage(message, 'buffer', {});
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
