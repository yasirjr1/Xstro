import Base from './Base.ts';
import { downloadMediaMessage } from 'baileys';
import { serialize } from '../serialize.ts';
import { prepareMessage } from '../../functions/index.ts';
import { isMediaMessage } from '../../utils/index.ts';
import type { MessageMisc, Serialize } from '../../@types';
import type { AnyMessageContent, WASocket } from 'baileys';

export default class Message extends Base {
  constructor(data: Serialize, client: WASocket) {
    super(data, client);
  }

  async send(content: string | Buffer, options?: MessageMisc & Partial<AnyMessageContent>) {
    const jid = options?.jid ?? this.jid;
    const updatedOptions = { ...options, jid };
    const msg = await prepareMessage(this.client, content, updatedOptions);
    return new Message(await serialize(this.client, msg!), this.client);
  }

  async edit(text: string) {
    return await this.client.sendMessage(this.jid, {
      text,
      edit: this.key,
    });
  }

  async delete() {
    const isRestrictedGroup = this.isGroup && !(await this.isBotAdmin());
    const isPrivateNotMe = !this.isGroup && !this.fromMe;

    if (isRestrictedGroup || isPrivateNotMe) {
      return await this.client.chatModify(
        {
          deleteForMe: {
            deleteMedia: isMediaMessage(this.data),
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
    return await downloadMediaMessage(this.data, 'buffer', {});
  }

  async isAdmin() {
    const metadata = await this.client.groupMetadata(this.jid);
    const allAdmins = metadata.participants.filter((v) => v.admin !== null).map((v) => v.id);
    return !Array.isArray(allAdmins)
      ? Array.from(allAdmins)
      : allAdmins.includes(this.sender ?? '');
  }

  async isBotAdmin() {
    const metadata = await this.client.groupMetadata(this.jid);
    const allAdmins = metadata.participants.filter((v) => v.admin !== null).map((v) => v.id);
    return !Array.isArray(allAdmins) ? Array.from(allAdmins) : allAdmins.includes(this.owner);
  }
}
