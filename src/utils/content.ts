import { fileTypeFromBuffer } from 'file-type';
import { isPath, isText } from './constants.js';
import { ContentTypeResult } from '../@types/content.js';
import logger from './logger.js';

export const getContentType = async (content: unknown): Promise<ContentTypeResult> => {
  try {
    if (typeof content === 'string' && isPath(content)) {
      return { isPath: true, path: content };
    }
    if (typeof content === 'string' && isText(content)) {
      return content;
    }
    let buffer: Buffer;
    if (Buffer.isBuffer(content)) {
      buffer = content;
    } else if (typeof content === 'string') {
      buffer = Buffer.from(content);
    } else {
      return undefined;
    }
    const fileType = await fileTypeFromBuffer(buffer);
    return fileType ?? undefined;
  } catch (error) {
    logger.error('Error detecting content type:', error);
    return undefined;
  }
};
