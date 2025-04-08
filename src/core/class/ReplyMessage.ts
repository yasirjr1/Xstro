import Message from './Message.ts';
import { normalizeMessageContent, getContentType } from 'baileys';
import { extractStringfromMessage } from '../../utils/index.ts';
import type { WAMessage, WAContextInfo, WASocket, WAMessageContent } from 'baileys';

export default class ReplyMessage extends Message {
  public quoted?: {
    key: WAMessage['key'];
    message: WAMessage['message'];
    type: string | undefined;
    sender: string;
    text: string | undefined;
    viewOnce?: boolean;
    broadcast: boolean;
  };

  constructor(
    client: WASocket,
    msg: WAMessage,
    settings: { prefix: string[]; mode: boolean },
    sudo: boolean,
  ) {
    super(client, msg, settings, sudo);
    const messageContent = this.message?.[this.mtype as keyof WAMessageContent];
    const Quoted = this.hasContextInfo(messageContent) ? messageContent.contextInfo : undefined;
    const quotedM = Quoted ? normalizeMessageContent(Quoted.quotedMessage) : undefined;

    if (Quoted && quotedM) {
      this.mentions = Quoted.mentionedJid || [];
      this.quoted = {
        key: {
          remoteJid: this.jid,
          fromMe: Quoted.participant === this.owner,
          id: Quoted.stanzaId,
          participant: this.isGroup ? Quoted.participant : undefined,
        },
        message: quotedM,
        type: getContentType(quotedM),
        sender: Quoted.participant ?? '',
        text: extractStringfromMessage(quotedM) ?? undefined,
        viewOnce:
          quotedM?.audioMessage?.viewOnce ||
          quotedM?.videoMessage?.viewOnce ||
          quotedM?.imageMessage?.viewOnce ||
          undefined,
        broadcast: !!Quoted.remoteJid,
      };
    }
  }

  private hasContextInfo(msg: unknown): msg is { contextInfo: WAContextInfo } {
    return !!(msg && typeof msg === 'object' && 'contextInfo' in msg && msg.contextInfo);
  }
}
