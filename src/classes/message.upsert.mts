import { Boom } from '@hapi/boom';
import util from 'util';
import type { BaileysEventMap, WASocket } from 'baileys';
import type { XMessage } from '../index.mts';
import { XMsg, commands, getAntilink, getAntiword, isUrl, upsertM } from '../index.mts';

export class MessagesUpsert {
  private client: WASocket;

  constructor(client: WASocket, upserts: BaileysEventMap['messages.upsert']) {
    this.client = client;
    this.handleUpsert(upserts);
  }
  /**
   * Main Upserts Manager
   */
  async handleUpsert(event: BaileysEventMap['messages.upsert']): Promise<void> {
    if (event) {
      const { messages, type, requestId } = event;
      upsertM({ messages, type, requestId });

      if (type === 'notify') {
        for (const upserts of messages) {
          const msg = await XMsg(this.client, upserts);
          Promise.all([this.runCommand(msg), this.upsertsM(msg)]);
        }
      }
    }
  }

  /**
   * Upserts Extra Events
   */
  async upsertsM(message: XMessage): Promise<void> {
    Promise.all([this.evaluator(message), this.Antilink(message), this.Antiword(message)]);
  }

  /**
   * Function to excute commands for text Messages only!
   */
  async runCommand(message: XMessage): Promise<void> {
    if (!message.text) return;

    for (const cmd of commands) {
      const handler = message.prefix.find((p) => message?.text?.startsWith(p));
      const match = message.text.slice(handler?.length || 0).match(cmd.name);
      try {
        if (handler && match) {
          if (!message.sudo && (message.mode || cmd.fromMe)) return;
          if (cmd.isGroup && !message.isGroup) return;
          const args = match[2] ?? '';
          await message.react('⏳');
          await cmd.function!(message, args);
        }
      } catch (err) {
        const cmdName = cmd.name.toString().toLowerCase().split(/\W+/)[2];
        await message.send(
          `\`\`\`─━❲ ERROR REPORT ❳━─\n\nFrom: ${cmdName}\nDetails: ${err.message}\`\`\``,
          {
            jid: message.owner,
          },
        );
        console.error(new Boom(err));
      }
    }
  }
  /**
   * Evalautor event
   */
  async evaluator(message: XMessage): Promise<void> {
    if (!message.text) return;

    if (message.text.startsWith('$ ')) {
      try {
        const code = message.text.slice(2);
        const result = await eval(`(async () => { ${code} })()`);
        await message.send(util.inspect(result, { depth: 1 }));
      } catch (error) {
        await message.send('Error: ' + (error instanceof Error ? error.message : String(error)));
      }
    }
  }
  /**
   * Antilink Manager
   */
  async Antilink(message: XMessage): Promise<void> {
    const settings = getAntilink(message.jid);
    if (!settings?.status) return;
    if (!message.isGroup || !message.text || message.sudo || (await message.isAdmin())) return;
    if (!isUrl(message.text)) return;

    if (settings.mode === 'kick') {
      if (!(await message.isBotAdmin())) return;
      await message.sendMessage(message.jid, { delete: message.key });
      await message.groupParticipantsUpdate(message.jid, [message.sender!], 'remove');
      await message.sendMessage(message.jid, {
        text: `@${message.sender!.split('@')[0]} has been kicked for sending links!`,
        mentions: [message.sender!],
      });
    }

    if (settings.mode === 'delete') {
      if (!(await message.isBotAdmin())) return;
      await message.sendMessage(message.jid, { delete: message.key });
      await message.sendMessage(message.jid, {
        text: `@${message.sender!.split('@')[0]} links are not allowed here!`,
        mentions: [message.sender!],
      });
    }
  }
  /**
   * Antiword manager
   */
  async Antiword(message: XMessage): Promise<void> {
    if (!message.isGroup || !message.text || message.sudo || (await message.isAdmin())) return;
    const settings = getAntiword(message.jid);
    if (!settings?.status) return;

    if (message.text) message.text = message.text.toLowerCase();
    if (
      settings.words.some((word) => {
        /**  Only match complete words with word boundaries */
        const pattern = new RegExp(`\\b${word}\\b`, 'i');
        return pattern.test(message.text || '');
      })
    ) {
      await message.sendMessage(message.jid, { delete: message.key });
      await message.sendMessage(message.jid, {
        text: `@${message.sender!.split('@')[0]} those words are not allowed here!`,
        mentions: [message.sender!],
      });
    }
  }
}
