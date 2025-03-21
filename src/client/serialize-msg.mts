import {
  downloadMediaMessage,
  getContentType,
  isJidBroadcast,
  isJidGroup,
  normalizeMessageContent,
} from 'baileys';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Boom } from '@hapi/boom';
import { extractTextFromMessage, numToJid } from '../utilities/constants.mts';
import { getConfig, loadMessage } from '../model/index.mts';
import type { AnyMessageContent, WAContextInfo, WAMessage, WAMessageKey } from 'baileys';
import type { Client, MessageMisc } from '../index.mts';
import { sendClientMessage } from './send-msg.mts';

export async function serialize(client: Client, messages: WAMessage) {
  const normalizedMessages = {
    ...messages,
    message: normalizeMessageContent(messages?.message),
  };
  const { key, message, ...msg } = normalizedMessages;
  const { prefix, mode, sudo } = await getConfig();
  const owner = numToJid(client?.user!.id);
  const sender =
    isJidGroup(key.remoteJid!) || msg.broadcast
      ? key.participant
      : key.fromMe
        ? owner
        : key.remoteJid;
  const mtype = getContentType(message);
  function hasContextInfo(msg: unknown): msg is { contextInfo: WAContextInfo } {
    if (!msg || typeof msg !== 'object' || msg === null) return false;
    return (
      'contextInfo' in msg && msg?.contextInfo !== null && typeof msg?.contextInfo === 'object'
    );
  }
  const messageContent = message?.[mtype!];
  const Quoted = hasContextInfo(messageContent) ? messageContent!?.contextInfo : undefined;
  const quotedM = Quoted ? normalizeMessageContent(Quoted!?.quotedMessage) : undefined;

  return {
    key,
    message,
    mtype,
    jid: key.remoteJid!,
    isGroup: isJidGroup(key.remoteJid!),
    owner: owner,
    prefix,
    sender: sender,
    text: extractTextFromMessage(message!),
    mentions: Quoted ? Quoted.mentionedJid : [],
    mode,
    sudo: sudo.includes(sender!) || sender === owner,
    loadMessage,
    user: function (match?: string): string | undefined {
      if (this.isGroup) {
        if (this.quoted && this.quoted.sender) return this.quoted.sender;
        if (match && Array.isArray(match)) return numToJid(match[0]);
        if (match && !Array.isArray(match)) return numToJid(match);
      } else {
        if (this.quoted && this.quoted.sender) return this.quoted.sender;
        if (match) return numToJid(match);
        if (!match) return this.jid;
      }
      return undefined;
    },
    quoted:
      Quoted && quotedM
        ? {
            key: {
              remoteJid: key.remoteJid,
              fromMe: Quoted.participant === owner,
              id: Quoted.stanzaId,
              participant:
                isJidGroup(key.remoteJid!) || isJidBroadcast(key.remoteJid!)
                  ? Quoted.participant
                  : undefined,
            },
            message: quotedM,
            type: getContentType(quotedM),
            sender: Quoted.participant!,
            text: extractTextFromMessage(quotedM),
            broadcast: Boolean(Quoted.remoteJid!),
            ...(({ quotedMessage, stanzaId, remoteJid, ...rest }): WAContextInfo => rest)(Quoted),
          }
        : undefined,
    isAdmin: async function (): Promise<boolean | unknown[]> {
      const metadata = await this.groupMetadata(this.jid);
      const allAdmins = metadata.participants.filter((v) => v.admin !== null).map((v) => v.id);
      return !Array.isArray(allAdmins) ? Array.from(allAdmins) : allAdmins.includes(sender!);
    },
    isBotAdmin: async function (): Promise<boolean | unknown[]> {
      const metadata = await this.groupMetadata(this.jid);
      const allAdmins = metadata.participants.filter((v) => v.admin !== null).map((v) => v.id);
      return !Array.isArray(allAdmins) ? Array.from(allAdmins) : allAdmins.includes(this.owner);
    },
    send: async function (
      content: string | Buffer,
      options?: MessageMisc & Partial<AnyMessageContent>,
    ) {
      const jid = options?.jid ?? this.jid;
      const updatedOptions = { ...options, jid };
      return await sendClientMessage(
        async (c, m) => await serialize(c, m),
        client,
        content,
        updatedOptions,
      );
    },
    edit: async function (text: string, key?: WAMessageKey): Promise<WAMessage | undefined> {
      return await client.sendMessage(this.jid, {
        text: text,
        edit: key || this.quoted?.key || this.key,
      });
    },
    async downloadM(
      message: WAMessage,
      shouldSaveasFile?: boolean,
    ): Promise<Buffer<ArrayBufferLike> | string> {
      try {
        const media = await downloadMediaMessage(message, 'buffer', {});
        if (shouldSaveasFile) {
          const saves = './downloads';
          const fileName = `${message.key.id}_${Date.now()}.bin`;
          const savePath = join(saves, fileName);
          await fs.mkdir(saves, { recursive: true });
          await fs.writeFile(savePath, media);
          return savePath;
        }
        return media;
      } catch (error) {
        throw new Error(error);
      }
    },
    forward: async function (
      jid: string,
      message: WAMessage,
      opts?: { quoted?: WAMessage; contextInfo?: WAContextInfo },
    ): Promise<WAMessage | undefined> {
      if (!message || !jid) {
        throw new Boom('Illegal there must be a Vaild Web Message and a Jid');
      }
      return await client.sendMessage(jid, { forward: message, ...opts }, { ...opts });
    },
    react: async function (emoji: string, message?: WAMessage): Promise<WAMessage | undefined> {
      return await client.sendMessage(this.jid, {
        react: { text: emoji, key: message?.key ? this.quoted?.key : this.key },
      });
    },
    delete: async function (message?: WAMessage): Promise<WAMessage | undefined> {
      return await client.sendMessage(this.jid, {
        delete: message!.key ? this.quoted!.key : this!.key,
      });
    },
    ...msg,
    ...(({ logger, ws, authState, signalRepository, user, ...rest }) => rest)(client),
  };
}
