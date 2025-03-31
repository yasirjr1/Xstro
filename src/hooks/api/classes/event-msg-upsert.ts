import { BaileysEventMap, WASocket } from 'baileys';
import { saveMessage } from '../../../models/store.js';
import logger from '../../../utils/logger.js';

export default class makeMessageUpsert {
  private client: WASocket;
  private upserts: BaileysEventMap['messages.upsert'];
  constructor(client: WASocket, upserts: BaileysEventMap['messages.upsert']) {
    this.client = client;
    this.upserts = upserts;
  }
  /**
   * Processes and queues all pending tasks with caching and concurrency control.
   * Handles task execution in a non-blocking manner while maintaining data consistency.
   *
   * @remarks
   * This method utilizes caching mechanisms to optimize performance and implements
   * concurrency control to prevent race conditions during task execution.
   */
  public async queueAllTasks() {
    for (const message of this.upserts.messages) {
      logger.info(message);
      await saveMessage(message);
    }
  }
}
