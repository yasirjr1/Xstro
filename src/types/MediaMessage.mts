import type { WAProto } from 'baileys';

export type MediaMessageKey = 'audioMessage' | 'videoMessage' | 'imageMessage';
export type MediaMessage = WAProto.IMessage[MediaMessageKey];
