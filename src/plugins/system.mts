import { Command } from '../core';
import { formatRuntime } from '../utils';
import pm2 from 'pm2';

Command({
  name: 'ping',
  fromMe: false,
  isGroup: false,
  desc: 'Ping the bot',
  type: 'system',
  function: async (message) => {
    const start = Date.now();
    const msg = await message.send('Pong!');
    const end = Date.now();
    return await msg.edit(`\`\`\`${end - start} ms\`\`\``);
  },
});

Command({
  name: 'runtime',
  fromMe: false,
  isGroup: false,
  desc: 'Get bot runtime',
  type: 'system',
  function: async (message) => {
    return await message.send(`\`\`\`${formatRuntime(process.uptime())}\`\`\``);
  },
});

Command({
  name: 'restart',
  fromMe: true,
  isGroup: false,
  desc: 'Restart the bot',
  type: 'system',
  dontAddCommandList: true,
  function: async (message) => {
    await message.send('Restarting...');
    pm2.restart('xstro', async (err: Error) => {
      if (err) {
        await message.send('Failed to restart process');
      }
    });
  },
});

Command({
  name: 'shutdown',
  fromMe: true,
  isGroup: false,
  desc: 'Shutdown Pm2 process',
  type: 'system',
  dontAddCommandList: true,
  function: async (message) => {
    await message.send('Goodbye....');
    return pm2.stop('xstro', async (err: Error) => {
      pm2.disconnect();
      if (err) {
        await message.send('Failed to shutdown');
        process.exit(1);
      }
    });
  },
});
