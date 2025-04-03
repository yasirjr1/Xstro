import { Command } from '../core/command.js';
import { formatRuntime } from '../utils/constants.js';
import pm2 from 'pm2';

Command({
  name: 'ping',
  fromMe: false,
  desc: 'Get Performance',
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
  desc: 'Get System uptime',
  type: 'system',
  function: async (message) => {
    return await message.send(`\`\`\`${formatRuntime(process.uptime())}\`\`\``);
  },
});

Command({
  name: 'restart',
  fromMe: true,
  desc: 'Restart the bot',
  type: 'system',
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
  desc: 'Shutdown Pm2 process',
  type: 'system',
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
