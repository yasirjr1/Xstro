import Base from './Base.ts';
import { getContentType, normalizeMessageContent, type WASocket, type WAMessage } from 'baileys';
import { extractStringfromMessage } from '../../utils/index.ts';

export default class Message extends Base {
  public message: WAMessage['message'];
  public mtype: string | undefined;
  public text: string | undefined;
  public isGroup: boolean;
  public mentions: string[];

  constructor(
    client: WASocket,
    msg: WAMessage,
    settings: { prefix: string[]; mode: boolean },
    sudo: boolean,
  ) {
    super(client, msg, settings, sudo);
    this.message = normalizeMessageContent(msg.message);
    this.mtype = getContentType(this.message);
    this.text = extractStringfromMessage(this.message) ?? undefined;
    this.isGroup = !!msg.key.remoteJid?.includes('@g.us');
    this.mentions = [];
  }
}
