import {
  delAntilink,
  delAntiword,
  getAntilink,
  getAntiword,
  Module,
  setAntilink,
  setAntiword,
} from '../index.mts';

Module({
  name: 'antilink',
  fromMe: false,
  isGroup: true,
  desc: 'Manage and Setup Antilink',
  type: 'group',
  function: async (message, match = '') => {
    const prefix = message.prefix;
    const [mode, option] = match.toLowerCase().split(' ');

    if (!mode)
      return message.send(
        `Usage:\n${prefix}antilink on\n${prefix}antilink off\n${prefix}antilink set kick\n${prefix}antilink set delete`,
      );

    const antilink = await getAntilink(message.jid);
    if (mode === 'on' && !antilink?.status)
      return setAntilink(message.jid, true, 'delete'), message.send('Antilink is now enabled');
    if (mode === 'on') return message.send('Antilink is already enabled');
    if (mode === 'off' && antilink?.status)
      return await delAntilink(message.jid), message.send('Antilink is now disabled');
    if (mode === 'off') return message.send('Antilink is already disabled');
    if (mode === 'set' && !antilink)
      return message.send(`Antilink must be enabled first, use ${prefix}antilink on`);
    if (mode === 'set' && option === 'kick')
      return (
        await setAntilink(message.jid, true, 'kick'),
        message.send('Antilink mode is now set to kick')
      );
    if (mode === 'set' && option === 'delete')
      return (
        await setAntilink(message.jid, true, 'delete'),
        message.send('Antilink mode is now set to delete')
      );
  },
});

Module({
  name: 'antiword',
  fromMe: false,
  isGroup: true,
  desc: 'Manage and Setup Antiword',
  type: 'group',
  function: async (message, match = '') => {
    const prefix = message.prefix;
    const [mode, ...words] = match.toLowerCase().split(' ');

    if (!mode)
      return message.send(
        `Usage:\n${prefix}antiword on\n${prefix}antiword off\n${prefix}antiword set badword1, badword2, badword3`,
      );

    const antiword = await getAntiword(message.jid);
    if (mode === 'on' && !antiword?.status)
      return (
        setAntiword(message.jid, 1, ['nobadwordshereuntiluserputsone']),
        message.send('Antiword is now enabled')
      );
    if (mode === 'on') return message.send('Antiword is already enabled');
    if (mode === 'off' && antiword?.status)
      return await delAntiword(message.jid), message.send('Antiword is now disabled');
    if (mode === 'off') return message.send('Antiword is already disabled');
    if (mode === 'set' && !antiword?.status)
      return message.send(`Antiword must be enabled first, use ${prefix}antiword on`);
    if (mode === 'set' && !words[0])
      return message.send(`Usage:\n${prefix}antiword set badword1, badword2, badword3`);
    if (mode === 'set') {
      const m = await setAntiword(message.jid, 1, words[0].split(','));
      return message.send(`Added ${m.added} badwords to list.`);
    }
  },
});
