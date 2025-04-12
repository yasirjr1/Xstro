import Message from '../Messages/Message.ts';
import { log } from '../../utils/index.ts';
import { messageDb } from '../../models/index.ts';
import { serialize } from '../serialize.ts';
import type { BaileysEventMap, WASocket } from 'baileys';
import { execCmd } from '../command.ts';

export default class MessageUpsert {
 private client: WASocket;
 private upserts: BaileysEventMap['messages.upsert'];

 constructor(client: WASocket, upserts: BaileysEventMap['messages.upsert']) {
  this.client = client;
  this.upserts = upserts;
  this.queueAll();
 }

 public async queueAll() {
  for (const message of this.upserts.messages) {
   try {
    const msg = await serialize(this.client, structuredClone(message));
    const cmdInstance = new Message(msg, this.client);
    await Promise.all([
     await messageDb.create({
      id: message.key.id,
      message,
     }),

     await execCmd(cmdInstance),
    ]);
   } catch (error) {
    log.error(`Task error: ${error}`);
   }
  }
 }
}
