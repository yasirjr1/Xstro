import { type Serialize } from '../../../@types/command.js';
import { commands } from '../../../core/command.js';
import logger from '../../../utils/logger.js';

async function runCommands(message: Serialize) {
  if (!message.text) return;

  for (const cmd of commands) {
    const handler = message.prefix.find((p) => message.text?.startsWith(p));
    const match = message.text.slice(handler?.length || 0).match(cmd.name as string);
    if (!handler || !match) continue;

    try {
      if (cmd.function) await cmd.function(message, match[2] ?? '');
    } catch (err) {
      logger.error(err);
    }
  }
}
