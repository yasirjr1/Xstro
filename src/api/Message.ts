import { serialize } from '../core';
import { logger } from '../utils';
import { storeMessages } from '../models';
import { runCommands } from '../tasks';
import { Semaphore } from '../hooks';
import type { Serialize } from '../@types';
import type { BaileysEventMap, WAMessage, WASocket } from 'baileys';

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
    let failedTasks = 0;

    const tasks = [
      async (message: WAMessage, msg: Serialize) => {
        await storeMessages(message);
        await runCommands(msg);
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
                  const msg = await serialize(this.client, message);
                  logger.info(msg?.message);
                  await task(message, msg);
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
