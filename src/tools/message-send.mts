import type { WAContextInfo, WAMessage, WAMessageContent } from 'baileys';

export async function sendMessage(
  content: string | Buffer | WAMessage | WAMessageContent,
  extras: { jid: string; forward: boolean; isButtons: boolean; contextInfo: WAContextInfo },
): Promise<WAMessage | undefined> {}

// TO DO: later
