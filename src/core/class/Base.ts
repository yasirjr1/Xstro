import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { downloadMediaMessage, isJidGroup } from 'baileys';
import { serialize } from '../serialize.ts';
import { prepareMessage } from '../../functions/index.ts';
import { parseJid, logger, isMediaMessage } from '../../utils/index.ts';
import type { WASocket, WAMessage, WAMessageKey, AnyMessageContent, WAContextInfo } from 'baileys';
import type { MessageMisc, Serialize } from '../../@types';

export default class Base {
  public client: WASocket;
  public key: WAMessageKey;
  public jid: string;
  public sender: string | undefined;
  public owner: string;
  public prefix: string[];
  public mode: boolean;
  public sudo: boolean;

  // Allow dynamic properties from client
  [key: string]: any;

  constructor(
    client: WASocket,
    msg: WAMessage,
    settings: { prefix: string[]; mode: boolean },
    sudo: boolean,
  ) {
    this.client = client;
    this.key = msg.key;
    this.jid = msg.key.remoteJid ?? '';
    this.owner = parseJid(client?.user?.id) ?? '';
    this.sender = this.getSender(msg);
    this.prefix = settings.prefix;
    this.mode = settings.mode;
    this.sudo = sudo;

    // Spread client properties, excluding logger, ws, authState, signalRepository, user
    const { logger, ws, authState, signalRepository, user, ...rest } = client;
    Object.assign(this, rest);
  }

  private getSender(msg: WAMessage): string | undefined {
    const { key } = msg;
    return key.fromMe ? this.owner : key.participant || key.remoteJid || undefined;
  }

  async send(
    content: string | Buffer,
    options?: MessageMisc & Partial<AnyMessageContent>,
  ): Promise<Serialize> {
    const jid = options?.jid ?? this.jid;
    return await prepareMessage(async (c, m) => await serialize(c, m), this.client, content, {
      ...options,
      jid,
    });
  }

  async edit(text: string, key?: WAMessageKey): Promise<WAMessage | undefined> {
    return await this.client.sendMessage(this.jid, { text, edit: key || this.key });
  }

  async downloadM(
    message: WAMessage,
    shouldSaveasFile?: boolean,
  ): Promise<string | Buffer<ArrayBufferLike> | undefined> {
    try {
      const media = await downloadMediaMessage(message, 'buffer', {});
      if (!shouldSaveasFile) return media;
      const file = path.join(os.tmpdir(), crypto.randomUUID());
      await fs.writeFile(file, media);
      return file;
    } catch (error) {
      logger.error(`Error while downloading:`, error as Error);
    }
  }

  async forward(
    jid: string,
    message: WAMessage,
    opts?: { quoted?: WAMessage; contextInfo?: WAContextInfo },
  ): Promise<WAMessage | undefined> {
    return await this.client.sendMessage(
      jid,
      {
        forward: message,
        ...opts,
        contextInfo: { isForwarded: false, forwardingScore: 0, ...opts?.contextInfo },
      },
      { ...opts },
    );
  }

  async react(emoji: string, message?: WAMessage): Promise<WAMessage | undefined> {
    return await this.client.sendMessage(this.jid, {
      react: { text: emoji, key: message?.key || this.key },
    });
  }

  async delete(message: WAMessage): Promise<void | WAMessage> {
    const isGroup = isJidGroup(this.jid);
    const isBotAdmin = await this.isBotAdmin();
    if ((isGroup && !isBotAdmin) || (!isGroup && !message?.key.fromMe)) {
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
