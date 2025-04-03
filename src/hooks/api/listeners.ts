import type { WASocket } from 'baileys';
import makeConnectionEvent from './classes/Socket.js';
import makeMessageUpsert from './classes/Message.js';

export default class MakeListeners {
  private clientSocket: WASocket;
  private saveCreds: () => Promise<void>;

  constructor(clientSocket: WASocket, optionals: { saveCreds: () => Promise<void> }) {
    this.clientSocket = clientSocket;
    this.saveCreds = optionals.saveCreds;
  }

  async manageProcesses() {
    return this.clientSocket.ev.process(async (events) => {
      if (events['creds.update']) {
        await this.saveCreds();
      }

      if (events['connection.update']) {
        await new makeConnectionEvent(
          this.clientSocket,
          events['connection.update'],
        ).handleConnectionUpdate();
      }

      if (events['messages.upsert']) {
        await new makeMessageUpsert(this.clientSocket, events['messages.upsert']).queueAllTasks();
      }
    });
  }
}
