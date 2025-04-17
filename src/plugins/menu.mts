import { Command, commands } from '../messaging/plugins.ts';
import type { Commands } from '../types/index.ts';

Command({
 name: 'menu',
 fromMe: false,
 isGroup: false,
 desc: 'Get all command names by category',
 type: 'utilities',
 dontAddCommandList: true,
 function: async (message) => {
  //    TO DO: add custom menu header
  let menu = '';

  // Filter commands where dontAddCommandList is not true
  const filteredCommands = commands.filter((cmd) => !cmd.dontAddCommandList);

  // Group commands by type
  const groupedCommands: Record<Commands['type'], string[]> =
   filteredCommands.reduce(
    (acc: Record<Commands['type'], string[]>, cmd: Commands) => {
     // Extract command name by splitting on Unicode symbols/punctuation
     const cmdName = cmd.name?.toString().split(/[\p{S}\p{P}]/gu)[5];
     if (!cmdName) return acc;

     // Use 'misc' for undefined types
     const type: Commands['type'] = (cmd.type || 'misc') as Commands['type'];
     if (!acc[type!]) acc[type!] = [];
     acc[type!].push(cmdName);
     return acc;
    },
    {} as Record<Commands['type'], string[]>,
   );

  // Sort categories alphabetically
  const sortedCategories = Object.keys(
   groupedCommands,
  ).sort() as Commands['type'][];

  // Build menu string
  for (const category of sortedCategories) {
   menu += `=== ${category} ===\n`;
   // Sort commands within category by name
   const sortedCommands = groupedCommands[category].sort();
   for (const cmd of sortedCommands) {
    menu += `- ${cmd}\n`;
   }
   menu += '\n';
  }
  // Send the menu
  return await message.send(menu.trim());
 },
});

Command({
 name: 'help',
 fromMe: false,
 isGroup: false,
 desc: 'Get all command names and descriptions',
 type: 'utilities',
 dontAddCommandList: true,
 function: async (message) => {
  // Placeholder for your custom message header
  let help = '';

  // Filter commands where dontAddCommandList is not true
  const filteredCommands = commands.filter((cmd) => !cmd.dontAddCommandList);

  // Collect command names and descriptions
  const commandList = filteredCommands
   .map((cmd) => {
    // Extract command name from RegExp
    const cmdName = cmd.name?.toString().split(/[\p{S}\p{P}]/gu)[5];
    if (!cmdName) return null;
    return { name: cmdName, desc: cmd.desc || 'No description' };
   })
   .filter((cmd) => cmd !== null);

  // Sort commands by name
  const sortedCommands = commandList.sort((a, b) =>
   a.name.localeCompare(b.name),
  );

  // Build help string
  for (const cmd of sortedCommands) {
   help += `- ${cmd.name}: ${cmd.desc}\n`;
  }

  // Send the help message
  return await message.send(help.trim());
 },
});
