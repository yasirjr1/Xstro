import { Command } from '../messaging/plugins.ts';

Command({
 name: 'add',
 fromMe: true,
 isGroup: true,
 desc: 'Add a participant to a group',
 type: 'group',
 function: async (message, match) => {
  if (!((await message.isAdmin()) && (await message.isBotAdmin()))) {
   return message.send('_Requires admin and bot admin privileges_');
  }

  // Parse the user to be added
  const user = message.user(match);
  if (!user) return message.send('_Provide a number_');

  // Important checks
  if (!(await message.client.onWhatsApp(user))) {
   return message.send('_This number is invaild!_');
  }

  // To add the user to a group

  await message.client.groupParticipantsUpdate(message.jid, [user], 'add');
  return await message.send(
   `_@${user.split('@')[0]} has been added to the  Group_`,
  );
 },
});
