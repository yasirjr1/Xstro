import { serialize } from '../core/index.ts';
import { Message } from '../core/Messages/index.ts';
import { logger } from '../utils/index.ts';
import { storeMessages } from '../models/index.ts';
import { runCommands } from '../tasks/index.ts';
import { Semaphore } from '../hooks/index.ts';
import type { Serialize } from '../@types/index.ts';
import type { BaileysEventMap, WASocket } from 'baileys';

export default class MessageUpsert {
  private client: WASocket;
  private upserts: BaileysEventMap['messages.upsert'];

  constructor(client: WASocket, upserts: BaileysEventMap['messages.upsert']) {
    this.client = client;
    this.upserts = upserts;
  }

  public async queueAllTasks() {
    const semaphore = new Semaphore(50);
    const taskPromises: Promise<void>[] = [];
    let failedTasks = 0;

    const tasks = [
      async (client: Message, data: Serialize) => {
        await storeMessages(data);
        await runCommands(client);
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
                  const data = await serialize(this.client, structuredClone(message));
                  const client = new Message(data, this.client);
                  await task(client, data);
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
      logger.info(`(Success ${taskPromises.length}) (${failedTasks} failed)`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.stack : String(error);
      logger.error(`Failed in queueAllTasks: ${errorMessage}`);
    }
  }
}
