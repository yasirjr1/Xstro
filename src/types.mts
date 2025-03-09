import type { WASocket, WAMessage } from 'baileys';
import type { XMsg } from './message.mts';

export type Client = WASocket;

export type cmdCategories =
  | 'misc'
  | 'system'
  | 'settings'
  | 'tools'
  | 'whatsapp'
  | 'group'
  | 'news'
  | 'chats'
  | 'download'
  | 'media'
  | 'utilities';

export interface Command {
  /** Name of function */
  name: string;
  /** Should the command always run when it recieves a messgae */
  on?: string | undefined;
  /** Function of the command, must be async */
  function?: (message: XMessage, match?: string) => Promise<unknown>;
  /** Should the command be for only sudo and bot owner */
  fromMe?: boolean;
  /** Should the command only be for Groups */
  isGroup?: boolean;
  /** Description of what the command does */
  desc?: string | undefined;
  /** Category of where the command should below */
  type?: cmdCategories;
  /** Should the command appear on the menu list? */
  dontAddCommandList?: boolean;
}

export type Config = {
  /** Prefixs unlimted */
  prefix: string[];
  /** Is the bot on private or public mode */
  mode: boolean;
  /** Auto read your messages, bluetick */
  autoRead: boolean;
  /** Auto read your contacts status */
  autoStatusRead: boolean;
  /** Auto like a contact status post */
  autolikestatus: boolean;
  /** Should the bot operate in groups? */
  disablegc: boolean;
  /** Should the bot operate in other personal chats excluding yours */
  disabledm: boolean;
  /** Should the bot always react before excuting a command */
  cmdReact: boolean;
  /** Should the bot bluetick any message that tiggers it to run a command? */
  cmdRead: boolean;
  /** Should the bot automatically save contact status */
  savebroadcast: boolean;
  /** List of disabled commands that the bot won't excute */
  disabledCmds: string[];
  /** List of all sudo numbers in jid format */
  sudo: string[];
  /** List of all banned users in jid format */
  banned: string[];
};

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

export type XMessage = ReturnType<typeof XMsg> extends Promise<infer T> ? T : undefined;
