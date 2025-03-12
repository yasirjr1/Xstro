import type { Command } from './types.mts';

export const commands: Command[] = [];

export function Module(cmd: Partial<Command>): Command {
  const fullCmd: Command = {
    name: new RegExp(`^\\s*(${cmd.name})(?:\\s+([\\s\\S]+))?$`, 'i'),
    function: cmd.function,
    fromMe: cmd.fromMe || false,
    isGroup: cmd.isGroup || false,
    desc: cmd.desc!,
    type: cmd.type!,
    dontAddCommandList: cmd.dontAddCommandList || false,
  };
  commands.push(fullCmd);
  return fullCmd;
}
