import ConnectionUpdate from './connection.ts';
import MakeGroupCache from './Services/g-cache.ts';
import MessageUpsert from './Services/m-upsert.ts';
import type { WASocket } from 'baileys';

export default class MakeEvents {
 private Socket: WASocket;
 private saveCreds: () => Promise<void>;

 constructor(
  clientSocket: WASocket,
  { saveCreds }: { saveCreds: () => Promise<void> },
 ) {
  this.Socket = clientSocket;
  this.saveCreds = saveCreds;
  this.manageProcesses();
 }

 async manageProcesses() {
  return this.Socket.ev.process(async (events) => {
   if (events['creds.update']) {
    await this.saveCreds();
   }

   if (events['connection.update']) {
    new ConnectionUpdate(this.Socket, events['connection.update']);
   }

   if (events['messages.upsert']) {
    new MessageUpsert(this.Socket, events['messages.upsert']);
   }

   new MakeGroupCache(this.Socket);
  });
 }
}
