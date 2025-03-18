import { Boom } from '@hapi/boom';
import { getDataType } from '../utilities/constants.mts';
import type { AnyMessageContent, WAMessage } from 'baileys';
import type { Client, MessageMisc, XMessage } from '../types.mts';

export async function sendClientMessage(
  createXMsg: (client: Client, msg: WAMessage) => Promise<XMessage>,
  client: Client,
  content: string | Buffer,
  options?: MessageMisc & Partial<AnyMessageContent>,
): Promise<void | XMessage> {
  const jid = options?.jid;
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

  const m = await client.sendMessage(jid!, messageContent, { ...options });
  return createXMsg(client, m!);
}
