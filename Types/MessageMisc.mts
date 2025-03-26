import type { WAMessage } from 'baileys';

export type MessageMisc = {
  /** Send to a specific number else it will auto get the jid */
  jid?: string;
  /** mime type */
  mimetype?: string;
  /** Select your content type if you want it for a specific type */
  type?: 'text' | 'audio' | 'image' | 'video' | 'sticker' | 'document';
  /** quoted message */
  quoted?: WAMessage;
};
