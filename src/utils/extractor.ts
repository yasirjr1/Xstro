import type { WAMessageContent } from 'baileys';

export function extractStringfromMessage(message: WAMessageContent) {
  if (message?.conversation) return message.conversation;
  if (message?.documentMessage?.caption) return message.documentMessage.caption;
}
