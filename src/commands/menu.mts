import { registerCommand, commands } from './_registers.mts';
import { formatBytes, runtime, toFancyFont } from '../index.mts';
import { platform, totalmem, freemem } from 'os';
import { environment } from '../../environment.ts';

const BOT_INFO = environment.META_DATA;
const TIME_ZONE = environment.TIME_ZONE;

registerCommand({
  name: 'menu',
  fromMe: false,
  desc: 'Show All Commands',
  type: undefined,
  dontAddCommandList: true,
  function: async (message) => {
    const cmds = commands.filter(
      (cmd) => cmd.name && !cmd.dontAddCommandList && !cmd.name.toString().includes('undefined'),
    ).length;
    let menuInfo = `\`\`\`
╭─── ${BOT_INFO?.split(';')?.[1] ?? `χѕтяσ м∂`} ────
│ User: ${message.pushName?.trim() ?? `Unknown`}
│ Owner: ${BOT_INFO?.split(';')[0].trim() ?? `αѕтяσχ11`}		
│ Plugins: ${cmds}
│ Mode: ${message.mode ? 'Private' : 'Public'}
│ Uptime: ${runtime(process.uptime())}
│ Platform: ${platform()}
│ Usage: ${formatBytes(totalmem() - freemem())}
│ Day: ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}
│ Date: ${new Date().toLocaleDateString('en-US')}
│ Time: ${new Date().toLocaleTimeString('en-US', { timeZone: TIME_ZONE })}
│ Node: ${process.version}
╰─────────────\`\`\`\n`;

    const cmdTypes = commands
      .filter((cmd) => cmd.name && !cmd.dontAddCommandList)
      .reduce((acc, cmd) => {
        const type = cmd.type || 'Misc';
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(cmd.name.toString().toLowerCase().split(/\W+/)[2]);
        return acc;
      }, {});

    const sort = Object.keys(cmdTypes).sort();

    let cmdNumbers = 1;

    sort.forEach((type) => {
      const sortedCommands = cmdTypes[type].sort();
      menuInfo += `╭──── *${toFancyFont(type)}* ────\n`;
      sortedCommands.forEach((cmd: string) => {
        menuInfo += `│${cmdNumbers}· ${toFancyFont(cmd)}\n`;
        cmdNumbers++;
      });
      menuInfo += `╰────────────\n`;
    });
    return await message.send(menuInfo.trim());
  },
});

registerCommand({
  name: 'list',
  fromMe: false,
  desc: 'Show All Commands',
  type: undefined,
  dontAddCommandList: true,
  function: async (message) => {
    let cmdsList: string = 'Command List\n\n';
    let cmdList: { cmd: string; desc?: string }[] = [];
    let cmd: string | undefined;
    let desc: string | undefined;

    commands.map((command) => {
      if (command.name) {
        const parts = command.name.toString().split(/\W+/);
        cmd = parts.length > 2 ? parts[2] : undefined;
      }
      desc = command?.desc;
      if (!command.dontAddCommandList && cmd !== undefined) cmdList.push({ cmd, desc });
    });

    cmdList.sort((a, b) => a.cmd.localeCompare(b.cmd));
    cmdList.forEach(({ cmd, desc }, num) => {
      cmdsList += `${num + 1} ${cmd}\n`;
      if (desc) cmdsList += `${desc}\n\n`;
    });

    return await message.send(cmdsList);
  },
});
