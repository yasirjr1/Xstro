import { commands } from '../../core/index.ts';
import { logger } from '../../utils/index.ts';
import type { Message } from '../Messages';

export async function execCmd(message: Message) {
  if (!message.data.text) return;

  for (const cmd of commands) {
    const handler = message.data.prefix.find((p: string) => message.data.text?.startsWith(p));
    const match = message.data.text.slice(handler?.length || 0).match(cmd.name as string);
    if (!handler || !match) continue;

    try {
      await cmd.function(message, match[2] ?? '');
    } catch (err) {
      logger.error(err);
    }
  }
}
