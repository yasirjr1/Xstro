import { commands } from '../core/index.ts';
import { logger } from '../utils/index.ts';
import type { Serialize } from '../@types';

export async function runCommands(message: Serialize) {
  console.log(message.text);
  console.log(message.prefix);
  if (!message.text) return;

  for (const cmd of commands) {
    const handler = message.prefix.find((p: string) => message.text?.startsWith(p));
    const match = message.text.slice(handler?.length || 0).match(cmd.name as string);
    if (!handler || !match) continue;

    try {
      await cmd.function(message, match[2] ?? '');
    } catch (err) {
      logger.error(err);
    }
  }
}
