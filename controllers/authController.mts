import type { BaileysEventMap, WASocket } from 'baileys';
import type { Boom } from '@hapi/boom';
import { DisconnectReason } from 'baileys';
import pm2 from 'pm2';
import { commands } from '../src/index.mts';

export class ConnectionUpdate {
  private client: WASocket;

  constructor(client: WASocket, updates: BaileysEventMap['connection.update']) {
    this.client = client;

    if (updates) {
      this.handleConnectionUpdate(updates);
    }
  }

  private async handleConnectionUpdate(
    updates: BaileysEventMap['connection.update'],
  ): Promise<void> {
    const { connection, lastDisconnect } = updates;

    switch (connection) {
      case 'connecting':
        this.handleConnecting();
        break;
      case 'close':
        await this.handleClose(lastDisconnect);
        break;
      case 'open':
        await this.handleOpen();
        break;
    }
  }

  private handleConnecting(): void {
    /** TO DO Add more events that will take place while connecting */
    console.log('connecting...');
  }

  private async handleClose(
    lastDisconnect?: BaileysEventMap['connection.update']['lastDisconnect'],
  ): Promise<void> {
    const error = lastDisconnect?.error as Boom;
    const statusCode = error?.output?.statusCode;

    if (statusCode === DisconnectReason.loggedOut) {
      this.client.ev.flush(true);
      this.client.ws.close();
      process.exit(1);
    } else {
      /** Pm2 restarts only works for productions */
      pm2.restart('xstro', async (error: Error) => {
        if (error) {
          console.error(
            'Issue occured while rebooting into a pm2 process, so rebooting using process exitor',
          );
          process.exit();
        }
      });
    }
  }

  private async handleOpen(): Promise<void> {
    const botCommands = commands.filter(
      (cmd) => cmd.name && !cmd.dontAddCommandList && !cmd.name.toString().includes('undefined'),
    ).length;

    const info =
      `\`\`\`Bot is online!\nOwner: ${this.client.user?.name ?? 'Unknown'}\nPlugins: ${botCommands}\`\`\``.trim();

    await this.client.sendMessage(this.client?.user?.id!, {
      text: info,
    });

    console.log(`Connected!`);
  }
}
