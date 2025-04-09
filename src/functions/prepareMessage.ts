import { Boom } from '@hapi/boom';
import { getDataType } from '../utils/index.ts';
import type { MessageMisc } from '../@types';
import type { AnyMessageContent, WASocket } from 'baileys';

export async function prepareMessage(
  client: WASocket,
  content: string | Buffer,
  options?: MessageMisc & Partial<AnyMessageContent>,
) {
  const jid = options?.jid ?? ' ';
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

  return await client.sendMessage(jid, messageContent, { ...options });
}
