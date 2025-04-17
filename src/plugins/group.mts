import { Command } from '../messaging/plugins.ts';

Command({
 name: 'add',
 fromMe: true,
 isGroup: true,
 desc: 'Add a participant to a group',
 type: 'group',
 function: async (message, match) => {
  const isAdmin = await message.isAdmin();
  const isBotAdmin = await message.isBotAdmin();

  if (!isAdmin && !isBotAdmin) {
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

Command({
 name: 'kick',
 fromMe: false,
 isGroup: true,
 desc: 'Ability to remove a participant from a Group',
 type: 'group',
 function: async (message, match) => {
  const isAdmin = await message.isAdmin();
  const isBotAdmin = await message.isBotAdmin();
  // Ensure the bot and the sender is an admin
  if (!isAdmin && !isBotAdmin) {
   return message.send('_Requires admin and bot admin privileges_');
  }
  // The user to be kicked
  const user = message.user(match);
  if (!user) return message.send('_Provide a number_');

  await message.client.groupParticipantsUpdate(message.jid, [user], 'remove');
  return await message.send(`_@${user.split('@')[0]} kicked from Group_`);
 },
});

Command({
 name: 'promote',
 fromMe: false,
 isGroup: true,
 desc: 'Ability to make a participant admin, if the bot is an Admin',
 type: 'group',
 function: async (message, match) => {
  const isAdmin = await message.isAdmin();
  const isBotAdmin = await message.isBotAdmin();
  // Ensure the bot and the sender is an admin
  if (!isAdmin && !isBotAdmin) {
   return message.send('_Requires admin and bot admin privileges_');
  }
  // The user to be made an Admin
  const user = message.user(match);
  if (!user) return message.send('_Provide a number_');

  // Make some checks to aviod repromoting a participant that's already an administrator
  const groupData = await message.client.groupMetadata(message.jid);

  // This returns an array of the Group admins
  const admins = groupData.participants
   .filter((v) => v.admin !== null)
   .map((v) => v.id);

  // Then we check to see if the user we want to promote exists in this admin array
  if (admins.includes(user)) {
   return await message.send(`_@${user.split('@')[0]} was already an admin_`);
  }

  await message.client.groupParticipantsUpdate(message.jid, [user], 'promote');
  return await message.send(`_@${user.split('@')[0]} is now an admin_`);
 },
});

Command({
 name: 'demote',
 fromMe: false,
 isGroup: true,
 desc: 'Ability to remove admin roles from a participant',
 type: 'group',
 function: async (message, match) => {
  const isAdmin = await message.isAdmin();
  const isBotAdmin = await message.isBotAdmin();
  // Ensure the bot and the sender is an admin
  if (!isAdmin || !isBotAdmin) {
   return message.send('_Requires admin and bot admin privileges_');
  }
  // The user to be demoted
  const user = message.user(match);
  if (!user) return message.send('_Provide a number_');

  // Check if the user is an admin before demoting
  const groupData = await message.client.groupMetadata(message.jid);
  const admins = groupData.participants
   .filter((v) => v.admin !== null)
   .map((v) => v.id);

  // Check if the user is not an admin
  if (!admins.includes(user)) {
   return await message.send(`_@${user.split('@')[0]} is not an admin_`);
  }

  await message.client.groupParticipantsUpdate(message.jid, [user], 'demote');
  return await message.send(`_@${user.split('@')[0]} is no longer an admin_`);
 },
});
