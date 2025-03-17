import type { BaileysEventMap, WASocket } from 'baileys';
import type { XMessage } from '../index.mts';
import { Boom } from '@hapi/boom';
import {
  XMsg,
  commands,
  getAntilink,
  getAntiword,
  isUrl,
  saveContact,
  upsertM,
} from '../index.mts';

export class MessagesUpsert {
  constructor(client: WASocket, upserts: BaileysEventMap['messages.upsert']) {
    this.client = client;
    this.handleUpsert(upserts);
  }

  private client: WASocket;

  async handleUpsert(event: BaileysEventMap['messages.upsert']): Promise<void> {
    if (!event) return;

    const { messages, type, requestId } = event;
    upsertM({ messages, type, requestId });

    if (type !== 'notify') return;

    await Promise.all(
      messages.map(async (msg) => {
        const xMsg = await XMsg(this.client, msg);
        console.log(xMsg.message?.imageMessage?.contextInfo?.mentionedJid);
        await Promise.all([
          this.executeCommand(xMsg),
          this.evaluator(xMsg),
          this.Antilink(xMsg),
          this.Antiword(xMsg),
          this.saveContacts(xMsg),
        ]);
      }),
    );
  }

  private async executeCommand(message: XMessage): Promise<void> {
    if (!message.text) return;

    for (const cmd of commands) {
      const handler = message.prefix.find((p) => message.text?.startsWith(p));
      const match = message.text.slice(handler?.length || 0).match(cmd.name);

      if (!handler || !match) continue;

      try {
        if (!message.sudo && (message.mode || cmd.fromMe)) return;
        if (cmd.isGroup && !message.isGroup) return;

        const args = match[2] ?? '';
        await message.react('⏳');
        await cmd.function!(message, args);
      } catch (err) {
        console.error(new Boom(err));
      }
    }
  }

  private async evaluator(message: XMessage): Promise<void> {
    if (!message.text?.startsWith('$ ')) return;

    try {
      const result = await eval(`(async () => { ${message.text.slice(2)} })()`);
      const util = await import('util');
      await message.send(util.inspect(result, { depth: 5 }));
    } catch (error) {
      await message.send('Error: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  private async Antilink(message: XMessage): Promise<void> {
    if (!message.isGroup || !message.text || message.sudo || (await message.isAdmin())) return;

    const settings = getAntilink(message.jid);
    if (!settings?.status || !isUrl(message.text) || !(await message.isBotAdmin())) return;

    await message.sendMessage(message.jid, { delete: message.key });
    const mentionText = `@${message.sender!.split('@')[0]}`;

    if (settings.mode === 'kick') {
      await message.groupParticipantsUpdate(message.jid, [message.sender!], 'remove');
      await message.sendMessage(message.jid, {
        text: `${mentionText} has been kicked for sending links!`,
        mentions: [message.sender!],
      });
    } else if (settings.mode === 'delete') {
      await message.sendMessage(message.jid, {
        text: `${mentionText} links are not allowed here!`,
        mentions: [message.sender!],
      });
    }
  }

  private async Antiword(message: XMessage): Promise<void> {
    if (!message.isGroup || !message.text || message.sudo || (await message.isAdmin())) return;

    const settings = getAntiword(message.jid);
    if (!settings?.status) return;

    const text = message.text.toLowerCase();
    if (settings.words.some((word) => new RegExp(`\\b${word}\\b`, 'i').test(text))) {
      await message.sendMessage(message.jid, { delete: message.key });
      await message.sendMessage(message.jid, {
        text: `@${message.sender!.split('@')[0]} those words are not allowed here!`,
        mentions: [message.sender!],
      });
    }
  }
  private async saveContacts(message: XMessage): Promise<void> {
    const bio_details = await message.fetchStatus(message.sender!).catch(() => null);
    const Info = (bio_details as unknown as { status: { status: string; setAt: string } }[])?.[0];
    const bio_text = Info?.status?.status ?? null;
    saveContact({
      jid: message.sender!,
      pushName: message.pushName,
      verifiedName: message.verifiedBizName,
      lid: null,
      bio: bio_text,
    });
  }
}
