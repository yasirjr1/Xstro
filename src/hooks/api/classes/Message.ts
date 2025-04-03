import { BaileysEventMap, WAMessage, WASocket } from 'baileys';
import { storeMessages } from '../../../models/store.js';
import logger from '../../../utils/logger.js';
import { Semaphore } from '../../cache/semaphore.js';
import { serialize } from '../functions/serialize.js';

export default class MessageUpsert {
  private client: WASocket;
  private upserts: BaileysEventMap['messages.upsert'];

  constructor(client: WASocket, upserts: BaileysEventMap['messages.upsert']) {
    this.client = client;
    this.upserts = upserts;
  }

  public async queueAllTasks() {
    const semaphore = new Semaphore(5);
    const taskPromises: Promise<void>[] = [];
    let failedTasks: number = 0;

    const tasks = [
      async (message: WAMessage) => {
        await storeMessages(message);
      },
      async (message: WAMessage, client: WASocket) => {
        await serialize(client, message);
      },
    ];

    try {
      for (const message of this.upserts.messages) {
        for (const task of tasks) {
          taskPromises.push(
            semaphore
              .acquire()
              .then(async () => {
                try {
                  await task(message, this.client);
                } catch (error) {
                  failedTasks++;
                  logger.error(`Task error: ${error}`);
                }
              })
              .finally(() => semaphore.release()),
          );
        }
      }
      await Promise.all(taskPromises);
      logger.info(`Processed ${taskPromises.length} tasks (${failedTasks} failed)`);
    } catch (error) {
      logger.error(`Batch failed: ${error}`);
    }
  }
}
