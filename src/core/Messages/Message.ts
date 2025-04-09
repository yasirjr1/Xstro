import Base from './Base.ts';
import { downloadMediaMessage } from 'baileys';
import { isMediaMessage } from '../../utils/index.ts';
import type { Serialize } from '../../@types';
import type { WAMessage, WASocket } from 'baileys';

export default class Message extends Base {
  public jid: Serialize['jid'];
  public key: Serialize['key'];
  public message: Serialize['message'];
  public mtype: Serialize['mtype'];
  public text: Serialize['text'];

  constructor(data: Serialize, client: WASocket) {
    super(data, client);
    this.jid = data.jid;
    this.key = data.key;
    this.message = data.message;
    this.mtype = data.mtype;
    this.text = data.text;
  }

  async downloadM(message: WAMessage = { key: this.key, message: this.message } as WAMessage) {
    return await downloadMediaMessage(message, 'buffer', {});
  }

  async delete(message: WAMessage = { key: this.key, message: this.message } as WAMessage) {
    if ((this.isGroup && !(await this.isBotAdmin())) || (!this.isGroup && !message?.key.fromMe)) {
      return this.client.chatModify(
        {
          deleteForMe: {
            deleteMedia: await isMediaMessage(message),
            key: message.key,
            timestamp: Date.now(),
          },
        },
        this.jid,
      );
    }
    return await this.client.sendMessage(this.jid, { delete: message.key });
  }
}
