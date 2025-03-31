import logger from '../utils/logger.js';
import type { Commands } from '../@types/command.js';

export const commands: Commands[] = [];

export function Command(metadata: Commands): number {
  const { name, function: func, fromMe, isGroup, desc, type, dontAddCommandList } = metadata;
  logger.info('Registering Commands...');
  return commands.push({
    name: new RegExp(`^\\s*(${name})(?:\\s+([\\s\\S]+))?$`, 'i'),
    function: func,
    fromMe: fromMe,
    isGroup: isGroup,
    desc: desc,
    type: type,
    dontAddCommandList: dontAddCommandList,
  });
}
