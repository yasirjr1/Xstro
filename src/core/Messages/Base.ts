import { prepareMessage } from '../../functions/index.ts';
import { serialize } from '../serialize.ts';
import AllMess from './AllMess.ts';
import type { Serialize, MessageMisc } from '../../@types';
import {
  type WASocket,
  type AnyMessageContent,
  type WAMessage,
  type WAMessageKey,
  jidNormalizedUser,
} from 'baileys';

export default class Base {
  public client: WASocket;
  public data: Serialize;
  public jid: string;
  public key: WAMessageKey;
  public owner: string;
  public sender: string | null | undefined;
  public isGroup: boolean | undefined;
  public isSudo: boolean;
  public isPublic: boolean;
  public user: (match?: string) => string | undefined;
  public prefix: string[];
  public quoted: Serialize['quoted'];

  constructor(data: Serialize, client: WASocket) {
    this.client = client;
    this.data = data;
    this.jid = jidNormalizedUser(data.jid);
    this.key = data.key;
    this.owner = data.owner;
    this.sender = data.sender;
    this.isGroup = data.isGroup;
    this.isSudo = data.sudo;
    this.isPublic = data.mode;
    this.user = data.user;
    this.prefix = data.prefix;
    this.quoted = data.quoted;
  }

  async send(content: string | Buffer, options?: MessageMisc & Partial<AnyMessageContent>) {
    const jid = options?.jid ?? this.jid;
    const updatedOptions = { ...options, jid };
    const msg = await prepareMessage(this.client, content, updatedOptions);
    return new AllMess(await serialize(this.client, msg!), this.client);
  }

  async edit(text: string): Promise<WAMessage | undefined> {
    return await this.client.sendMessage(this.jid, {
      text,
      edit: this.key ?? this.quoted?.key,
    });
  }

  async isAdmin(): Promise<boolean | unknown[]> {
    const metadata = await this.client.groupMetadata(this.jid);
    const allAdmins = metadata.participants.filter((v) => v.admin !== null).map((v) => v.id);
    return !Array.isArray(allAdmins)
      ? Array.from(allAdmins)
      : allAdmins.includes(this.sender ?? '');
  }

  async isBotAdmin(): Promise<boolean | unknown[]> {
    const metadata = await this.client.groupMetadata(this.jid);
    const allAdmins = metadata.participants.filter((v) => v.admin !== null).map((v) => v.id);
    return !Array.isArray(allAdmins) ? Array.from(allAdmins) : allAdmins.includes(this.owner ?? '');
  }
}
