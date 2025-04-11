import ReplyMessage from './ReplyMessage.ts';
import type { Serialize } from '../../types/index.ts';
import { type WASocket, type WAMessageKey } from 'baileys';

export default class Base {
  public client: WASocket;
  public data: Serialize;
  public jid: string;
  public id: string | null | undefined;
  public fromMe: boolean | null | undefined;
  public participant: string | null | undefined;
  public key: WAMessageKey;
  public owner: string;
  public sender: string | null | undefined;
  public isGroup: boolean | undefined;
  public sudo: boolean;
  public mode: boolean;
  public user: (match?: string) => string | undefined;
  public prefix: string[];
  public quoted?: ReplyMessage;

  constructor(data: Serialize, client: WASocket) {
    this.client = client;
    this.data = data;
    this.jid = data.jid;
    this.id = data.key.id;
    this.fromMe = data.key.fromMe;
    this.participant = data.key.participant;
    this.key = data.key;
    this.owner = data.owner;
    this.sender = data.sender;
    this.isGroup = data.isGroup;
    this.sudo = data.sudo;
    this.mode = data.mode;
    this.user = data.user;
    this.prefix = data.prefix;
    this.quoted = data.quoted ? new ReplyMessage(data, this.client) : undefined;
  }
}
