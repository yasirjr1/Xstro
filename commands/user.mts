import { registerCommand, commands } from './_registers.mts';
import { editConfig, getConfig } from '../databases/index.mts';

registerCommand({
  name: 'mode',
  fromMe: true,
  desc: 'Set bot mode to public or private',
  type: 'user',
  function: async (message, match) => {
    if (
      !match ||
      (match.toLowerCase().trim() !== 'public' && match.toLowerCase().trim() !== 'private')
    ) {
      return message.send(`Usage: ${message.prefix[0]}mode public | private`);
    }
    const db = (await getConfig()).mode;
    if (match === 'private' && db) return message.send('Already set to private');
    if (match === 'public' && !db) return message.send('Already set to public');
    await editConfig({ mode: match === 'private' ? true : false });
    return await message.send(`Mode set to ${match}`);
  },
});

registerCommand({
  name: 'enablecmd',
  fromMe: true,
  desc: 'Enable some commands',
  type: 'user',
  function: async (msg, args) => {
    const commandsList = commands.map((cmds) => cmds.name.toString().toLowerCase().split(/\W+/)[2]);
    if (!args)
      return msg.send(
        'Provide me some commands to enable\n\n' + msg.prefix[0] + 'enablecmd pin,kick,gname',
      );

    const chosen = args.split(',').map((cmd) => cmd.trim());
    const non_allowed = ['restart', 'shutdown', 'disablecmd', 'enablecmd'];

    const disallowed = chosen.filter((cmd) => non_allowed.includes(cmd));
    if (disallowed.length > 0) return msg.send(`Cannot enable: ${disallowed.join(', ')}`);

    const invalid = chosen.filter((cmd) => !commandsList.includes(cmd));
    const valid = chosen.filter((cmd) => commandsList.includes(cmd) && !non_allowed.includes(cmd));
    const db = (await getConfig()).disabledCmds || [];

    if (valid.length === 0) return msg.send('No commands to enable.');
    if (invalid.length > 0) await msg.send(`Invalid commands ignored: ${invalid.join(', ')}`);

    const enabled = valid.filter((cmd) => db.includes(cmd));
    const updatedDisabled = db.filter((cmd) => !valid.includes(cmd));

    await editConfig({ disabledCmds: updatedDisabled });
    return msg.send(
      enabled.length > 0 ? `Enabled: ${enabled.join(', ')}` : 'No commands were disabled.',
    );
  },
});

registerCommand({
  name: 'disablecmd',
  fromMe: true,
  desc: 'Disable some commands',
  type: 'user',
  function: async (msg, args) => {
    const commandsList = commands.map((cmds) => cmds.name.toString().toLowerCase().split(/\W+/)[2]);
    if (!args)
      return msg.send(
        'Provide me some commands to disable\n\n' + msg.prefix[0] + 'disablecmd pin,kick,gname',
      );

    const chosen = args.split(',').map((cmd) => cmd.trim());
    const non_allowed = ['restart', 'shutdown', 'disablecmd', 'enablecmd'];

    const disallowed = chosen.filter((cmd) => non_allowed.includes(cmd));
    if (disallowed.length > 0) return msg.send(`Cannot disable: ${disallowed.join(', ')}`);

    const invalid = chosen.filter((cmd) => !commandsList.includes(cmd));
    const valid = chosen.filter((cmd) => commandsList.includes(cmd) && !non_allowed.includes(cmd));
    const db = (await getConfig()).disabledCmds || [];
    const newDisabled = valid.filter((cmd) => !db.includes(cmd));

    if (valid.length === 0) return msg.send('No commands to disable.');
    if (invalid.length > 0) await msg.send(`Invalid commands ignored: ${invalid.join(', ')}`);

    await editConfig({ disabledCmds: Array.from(new Set([...db, ...valid])) });
    return msg.send(
      newDisabled.length > 0 ? `Disabled: ${newDisabled.join(', ')}` : 'No new commands disabled.',
    );
  },
});
