import { Command } from '../core/index.ts';

Command({
  name: 'bio',
  fromMe: true,
  isGroup: false,
  desc: 'Change your WA Bio',
  type: 'whatsapp',
  function: async (message, match) => {
    if (!match) return message.send('No bio text provided');
    await message.updateProfileStatus(match);
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
    await message.updateProfileName(match);
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
    if (!(await message.onWhatsApp(jid))) return message.send('User is not on WhatsApp');
    await message.send('User blocked successfully');
    return message.updateBlockStatus(jid, 'block');
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
    return message.updateBlockStatus(jid, 'unblock');
  },
});

Command({
  name: 'pp',
  fromMe: true,
  isGroup: false,
  desc: 'Update Your Profile Image',
  type: 'whatsapp',
  function: async (message) => {
    if (!message.quoted || !message.quoted.message.imageMessage) {
      return message.send('No image replied to');
    }
    const media = await message.downloadM(message.quoted);
    if (!media || !Buffer.isBuffer(media)) return message.send('Failed to download image');
    if (!message?.owner) return;
    await message.updateProfilePicture(message.owner, media);
    return message.send('Profile picture updated successfully');
  },
});

Command({
  name: 'vv',
  fromMe: true,
  isGroup: false,
  desc: 'Forwards view-once message',
  type: 'whatsapp',
  function: async (message) => {
    if (!message.quoted?.viewOnce) return message.send('No view-once message replied to');
    const msg = message?.quoted?.message;
    const messageType = ['imageMessage', 'videoMessage', 'audioMessage'].find(
      (type) => msg?.[type as keyof typeof msg],
    );
    if (!messageType || !msg) return message.send('No valid media found');
    const media = msg[messageType as keyof typeof msg] as { viewOnce: boolean };
    media.viewOnce = false;
    if (!message?.owner) return;
    return await message.forward(message.owner, message.quoted, { quoted: message.quoted });
  },
});

Command({
  name: 'tovv',
  fromMe: true,
  isGroup: false,
  desc: 'Converts message to view-once',
  type: 'whatsapp',
  function: async (message) => {
    if (!message.quoted) return message.send('No media replied to');
    const quoted = message.quoted;
    const messageType = ['imageMessage', 'videoMessage', 'audioMessage'].find(
      (msg) => msg in quoted.message,
    );
    if (!messageType) return message.send('No valid media found');
    (quoted.message[messageType as keyof typeof quoted.message] as any).viewOnce = true;
    if (!message?.owner) return;
    return await message.forward(message.owner, quoted, { quoted });
  },
});

Command({
  name: 'edit',
  fromMe: true,
  isGroup: false,
  desc: 'Edit your own message',
  type: 'whatsapp',
  function: async (message, match) => {
    if (!message?.quoted?.key.fromMe) return message.send('Quoted message not from me');
    if (!match) return message.send('No edit text provided');
    return message.edit(match);
  },
});

Command({
  name: 'dlt',
  fromMe: false,
  isGroup: false,
  desc: 'Delete a message for us and others if bot is admin',
  type: 'whatsapp',
  function: async (message) => {
    if (!message.quoted) return message.send('No message quoted to delete');
    return await message.delete(message.quoted);
  },
});

Command({
  name: 'blocklist',
  fromMe: true,
  isGroup: false,
  desc: 'Get all the list of numbers you have blocked',
  type: 'whatsapp',
  function: async (message) => {
    const users = await message.fetchBlocklist();
    if (!users) return message.send('No blocked users found');
    return await message.send(users.map((nums: string) => `\n@${nums.split('@')[0]}`).join(''), {
      mentions: users,
    });
  },
});

Command({
  name: 'save',
  fromMe: true,
  isGroup: false,
  desc: 'Save a status by replying to it',
  type: 'whatsapp',
  function: async (message) => {
    if (!message?.quoted?.broadcast) return message.send('No status replied to');
    if (!message?.owner) return;
    await message.forward(message.owner, message.quoted, { quoted: message.quoted });
    return message.send('Status saved successfully');
  },
});
