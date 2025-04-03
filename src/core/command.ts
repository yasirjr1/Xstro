import type { Commands } from '../@types/command.js';

export const commands: Commands[] = [];

export function Command({
  name,
  function: func,
  fromMe,
  isGroup,
  desc,
  type,
  dontAddCommandList,
}: Commands): number {
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
