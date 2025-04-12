import { Command } from '../messaging/plugins.ts';

Command({
 name: 'bio',
 fromMe: true,
 isGroup: false,
 desc: 'Change your WA Bio',
 type: 'whatsapp',
 function: async (message, match) => {
  if (!match) return message.send('No bio text provided');
  await message.client.updateProfileStatus(match);
  return message.send('Bio updated successfully');
 },
});

Command({
 name: 'waname',
 fromMe: true,
 isGroup: false,
 desc: 'Change your WA Profile Name',
 type: 'whatsapp',
 function: async (message, match) => {
  if (!match) return message.send('No name provided');
  await message.client.updateProfileName(match);
  return message.send('Name updated successfully');
 },
});

Command({
 name: 'block',
 fromMe: true,
 isGroup: false,
 desc: 'Block a user from Messaging you',
 type: 'whatsapp',
 function: async (message, match) => {
  const jid = message.user(match);
  if (!jid) return message.send('No user specified to block');
  if (!(await message.client.onWhatsApp(jid)))
   return message.send('User is not on WhatsApp');
  await message.send('User blocked successfully');
  return message.client.updateBlockStatus(jid, 'block');
 },
});

Command({
 name: 'unblock',
 fromMe: true,
 isGroup: false,
 desc: 'Unblock a user to allow Messaging',
 type: 'whatsapp',
 function: async (message, match) => {
  const jid = message.user(match);
  if (!jid) return message.send('No user specified to unblock');
  await message.send('User unblocked successfully');
  return message.client.updateBlockStatus(jid, 'unblock');
 },
});

Command({
 name: 'pp',
 fromMe: true,
 isGroup: false,
 desc: 'Update Your Profile Image',
 type: 'whatsapp',
 function: async (message) => {
  const msg = message.quoted;
  if (!msg || !msg.image) return message.send('No image replied to');
  const media = await msg.downloadM();
  if (!media) return message.send('Failed to download image');
  await message.client.updateProfilePicture(message.owner, media);
  return message.send('Profile picture updated successfully');
 },
});

Command({
 name: 'vv',
 fromMe: true,
 isGroup: false,
 desc: 'Converts view-once to message',
 type: 'whatsapp',
 function: async (message) => {
  const msg = message.quoted;
  if (!msg || !msg.viewOnce) return message.send('_Reply a viewOnce message_');
  if (msg.message) {
   const mediaType = msg.mtype as
    | 'imageMessage'
    | 'videoMessage'
    | 'audioMessage';
   msg.message[mediaType]!.viewOnce = false;
   return await msg.forward(message.jid);
  }
 },
});

Command({
 name: 'tovv',
 fromMe: true,
 isGroup: false,
 desc: 'Converts message to view-once',
 type: 'whatsapp',
 function: async (message) => {
  const msg = message.quoted;
  if (!msg || (!msg.image && !msg.audio && !msg.video))
   return message.send('_Reply a media message_');
  if (msg.message) {
   const mediaType = msg.mtype as
    | 'imageMessage'
    | 'videoMessage'
    | 'audioMessage';
   msg.message[mediaType]!.viewOnce = true;
   return await msg.forward(message.jid);
  }
 },
});

Command({
 name: 'edit',
 fromMe: true,
 isGroup: false,
 desc: 'Edit your own message',
 type: 'whatsapp',
 function: async (message, match) => {
  const msg = message.quoted;
  if (!msg || !msg?.key.fromMe)
   return message.send('Reply a message from you.');
  if (!match) return message.send(`Usage: $${message.prefix[0]}edit Hello.`);
  return await msg.edit(match);
 },
});

Command({
 name: 'dlt',
 fromMe: false,
 isGroup: false,
 desc: 'Delete a message for us and others if bot is admin',
 type: 'whatsapp',
 function: async (message) => {
  const msg = message.quoted;
  if (!msg) return message.send('No message quoted to delete');
  return await msg.delete();
 },
});

Command({
 name: 'blocklist',
 fromMe: true,
 isGroup: false,
 desc: 'Get all the list of numbers you have blocked',
 type: 'whatsapp',
 function: async (message) => {
  const users = await message.client.fetchBlocklist();
  if (!users) return message.send('No blocked users found');
  return await message.send(
   users.map((nums: string) => `\n@${nums.split('@')[0]}`).join(''),
   {
    mentions: users,
   },
  );
 },
});

Command({
 name: 'save',
 fromMe: true,
 isGroup: false,
 desc: 'Save a status by replying to it',
 type: 'whatsapp',
 function: async (message) => {
  const msg = message.quoted;
  if (!msg?.broadcast) return message.send('No status replied to');
  await msg.forward(message.owner);
  return message.send('Status saved!');
 },
});
