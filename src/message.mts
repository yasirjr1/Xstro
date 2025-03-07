import { writeFile } from 'fs/promises';
import { Boom } from '@hapi/boom';
import type { AnyMessageContent, WAContextInfo, WAMessage } from 'baileys';
import {
  downloadMediaMessage,
  getContentType,
  isJidBroadcast,
  isJidGroup,
  normalizeMessageContent,
} from 'baileys';
import { extractTextFromMessage, getDataType, numToJid } from './constants.mjs';
import { getConfig } from './model/index.mjs';
import type { Client, MessageMisc } from './types.mjs';

/** Message repack to simplfy over all bot message handling */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function XMsg(client: Client, messages: WAMessage) {
  const normalizedMessages = {
    ...messages,
    message: normalizeMessageContent(messages.message),
  };
  const { key, message, ...msg } = normalizedMessages;
  const { user, sendMessage } = client;
  const { prefix, mode, sudo } = getConfig();
  const owner = numToJid(user!.id);
  const sender =
    isJidGroup(key.remoteJid!) || isJidBroadcast(key.remoteJid!)
      ? key.participant
      : key.fromMe
        ? owner
        : key.remoteJid;
  const mtype = getContentType(message);
  function hasContextInfo(msg: unknown): msg is { contextInfo: WAContextInfo } {
    if (!msg || typeof msg !== 'object' || msg === null) return false;
    return 'contextInfo' in msg && msg.contextInfo !== null && typeof msg.contextInfo === 'object';
  }
  const messageContent = message?.[mtype!];
  const Quoted = hasContextInfo(messageContent) ? messageContent.contextInfo : undefined;
  const quotedM = Quoted ? normalizeMessageContent(Quoted!.quotedMessage) : undefined;

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
    user: function (match?: string): string | undefined {
      if (this.isGroup) {
        if (this.quoted && this.quoted.sender) return this.quoted.sender;
        if (match && Array.isArray(match)) return numToJid(match[0]);
        if (match && !Array.isArray(match)) return numToJid(match);
      } else {
        if (this.quoted && this.quoted.sender) return this.quoted.sender;
        if (match) return numToJid(match);
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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/explicit-function-return-type
            ...(({ quotedMessage, stanzaId, remoteJid, ...rest }) => rest)(Quoted),
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
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    send: async function (
      content: string | Buffer,
      options?: MessageMisc & Partial<AnyMessageContent>,
    ) {
      const jid = options?.jid ?? this.jid;
      const explicitType = options?.type;
      const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
      let messageContent: AnyMessageContent;

      const type = explicitType || (await getDataType(content)).contentType;
      const mimeType = explicitType ? options?.mimetype : (await getDataType(content)).mimeType;

      if (type === 'text') {
        messageContent = { text: content.toString(), ...options };
      } else if (type === 'image') {
        messageContent = { image: buffer, ...options };
      } else if (type === 'audio') {
        messageContent = { audio: buffer, ...options };
      } else if (type === 'video') {
        messageContent = { video: buffer, ...options };
      } else if (type === 'sticker') {
        messageContent = { sticker: buffer, ...options };
      } else if (type === 'document') {
        messageContent = {
          document: buffer,
          mimetype: mimeType || 'application/octet-stream',
          ...options,
        };
      } else {
        throw new Boom('Unknown content type');
      }

      const m = await sendMessage(jid!, messageContent, { ...options });
      return XMsg(client, m!);
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    edit: async function (text: string) {
      const msg = await client.sendMessage(this.jid, {
        text: text,
        edit: this.quoted ? this.quoted.key : this.key,
      });
      return XMsg(client, msg!);
    },
    downloadM: async function (
      message: WAMessage,
      shouldSaveasFile?: boolean,
    ): Promise<Buffer<ArrayBufferLike> | void> {
      const media = await downloadMediaMessage(message, 'buffer', {});
      if (shouldSaveasFile) {
        return await writeFile(message.key.id!, media);
      }
      return media;
    },
    forward: async function (
      jid: string,
      message: WAMessage,
      opts?: { quoted: WAMessage },
    ): Promise<void | unknown> {
      if (!message || !jid) {
        throw new Boom('Illegal there must be a Vaild Web Message and a Jid');
      }
      const m = await sendMessage(jid, { forward: message, ...opts }, { ...opts });
      return XMsg(client, m!);
    },
    react: async function (emoji: string, message?: WAMessage): Promise<void | unknown> {
      const emojiRegex = /\p{Emoji}/u;
      if (!emoji || !emojiRegex.test(emoji)) {
        throw new Boom('Illegal, there must be an emoji');
      }
      const m = await sendMessage(this.jid, {
        react: { text: emoji, key: message?.key ? this.quoted?.key : this.key },
      });
      return XMsg(client, m!);
    },
    delete: async function (message?: WAMessage): Promise<unknown | void> {
      const m = await sendMessage(this.jid, {
        delete: message!.key ? this.quoted!.key : this!.key,
      });
      return XMsg(client, m!);
    },
    ...msg,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/explicit-function-return-type
    ...(({ logger, ws, authState, signalRepository, user, ...rest }) => rest)(client),
  };
}
