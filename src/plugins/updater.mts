import { exec } from 'child_process';
import { promisify } from 'util';
import { log } from '../utils/index.ts';
import { Command } from '../messaging/plugins.ts';

const execPromise = promisify(exec);

Command({
 name: 'update',
 fromMe: true,
 isGroup: false,
 desc: 'Update the bot',
 type: 'utilities',
 function: async (message, match) => {
  const prefix = message.prefix[0];
  await execPromise('git fetch');

  const { stdout: logOutput } = await execPromise(
   'git log master..origin/master --pretty=format:%s',
  );
  const commits = logOutput.split('\n').filter(Boolean);

  if (match === 'now') {
   if (commits.length === 0) {
    return await message.send('No changes in the latest commit');
   }

   await message.send('Updating...');
   await execPromise('git stash && git pull origin ' + 'master');

   await message.send('Restarting...');
   const dependencyChanged = await updatedDependencies();

   if (dependencyChanged) {
    await message.send('Dependancies changed installing new dependancies');
    await message.send('Restarting...');
    await execPromise('npm install && pm2 restart ' + 'xstro');
   } else {
    await message.send('Restarting...');
    await execPromise('pm2 restart ' + 'xstro');
   }
  } else {
   if (commits.length === 0) {
    return await message.send('No changes in the latest commit');
   }

   let changes = 'New update available!\n\n';
   changes += 'Commits: ' + commits.length + '\n';
   changes += 'Changes: \n';
   commits.forEach((commit: string, index: number) => {
    changes += index + 1 + '. ' + commit + '\n';
   });
   changes += '\nTo update, send ' + prefix + 'update now';
   await message.send(changes);
  }
 },
});

async function updatedDependencies(): Promise<boolean> {
 try {
  const { stdout: diff } = await execPromise('git diff master..origin/master');
  return diff.includes('"dependencies":');
 } catch (error) {
  log.error('Error occurred while checking package.json:', error);
  return false;
 }
}
