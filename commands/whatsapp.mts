import { lang } from '../src/index.mts';
import { registerCommand } from './_registers.mts';

registerCommand({
  name: 'bio',
  fromMe: true,
  desc: 'Change your WA Bio',
  type: 'whatsapp',
  function: async (message, match) => {
    if (!match) return message.send(lang.commands.bio.not_provided);
    await message.updateProfileStatus(match);
    return message.send(lang.commands.bio.successfull);
  },
});

registerCommand({
  name: 'waname',
  fromMe: true,
  desc: 'Change your WA Profile Name',
  type: 'whatsapp',
  function: async (message, match) => {
    if (!match) return message.send(lang.commands.waname.not_provided);
    await message.updateProfileName(match);
    return message.send(lang.commands.waname.sucessfull);
  },
});

registerCommand({
  name: 'block',
  fromMe: true,
  desc: 'Block a user from Messaging you',
  type: 'whatsapp',
  function: async (message, match) => {
    const jid = message.user(match);
    if (!jid) return message.send(lang.commands.block.not_provided);
    if (!(await message.onWhatsApp(jid)))
      return message.send(lang.commands.block.not_whatsapp_user);
    await message.send(lang.commands.block.successfull);
    return message.updateBlockStatus(jid, 'block');
  },
});

registerCommand({
  name: 'unblock',
  fromMe: true,
  desc: 'Unblock a user to allow Messaging',
  type: 'whatsapp',
  function: async (message, match) => {
    const jid = message.user(match);
    if (!jid) return message.send(lang.commands.unblock.not_provided);
    await message.send(lang.commands.unblock.successfull);
    return message.updateBlockStatus(jid, 'unblock');
  },
});

registerCommand({
  name: 'pp',
  fromMe: true,
  desc: 'Update Your Profile Image',
  type: 'whatsapp',
  function: async (message) => {
    if (!message.quoted || !message.quoted.message.imageMessage) {
      return message.send(lang.commands.pp.no_image);
    }
    const media = await message.downloadM(message.quoted);
    if (!media || !Buffer.isBuffer(media)) return message.send(lang.commands.pp.failed);
    await message.updateProfilePicture(message.owner, media);
    return message.send(lang.commands.pp.successfull);
  },
});

registerCommand({
  name: 'vv',
  fromMe: true,
  desc: 'Forwards view-once message',
  type: 'whatsapp',
  function: async (message) => {
    if (!message.quoted?.viewOnce) return message.send(lang.commands.vv.no_view_once);
    const msg = message?.quoted?.message;
    const media = msg[['imageMessage', 'videoMessage', 'audioMessage'].find((type) => msg[type])!];
    media.viewOnce = false;
    return await message.forward(message.owner, message.quoted, { quoted: message.quoted });
  },
});

registerCommand({
  name: 'tovv',
  fromMe: true,
  desc: 'Converts message to view-once',
  type: 'whatsapp',
  function: async (message) => {
    if (!message.quoted) return message.send(lang.commands.tovv.no_media);
    const quoted = message.quoted;
    quoted.message[
      ['imageMessage', 'videoMessage', 'audioMessage'].find((msg) => quoted.message[msg])!
    ].viewOnce = true;
    return await message.forward(message.owner, quoted, { quoted });
  },
});

registerCommand({
  name: 'edit',
  fromMe: true,
  desc: 'Edit your own message',
  type: 'whatsapp',
  function: async (message, match) => {
    if (!message?.quoted?.key.fromMe) return message.send(lang.commands.edit.not_from_me);
    if (!match) return message.send(lang.commands.edit.no_text);
    return message.edit(match);
  },
});

registerCommand({
  name: 'dlt',
  fromMe: false,
  desc: 'Delete a message for us and others if bot is admin',
  type: 'whatsapp',
  function: async (message) => {
    if (!message.quoted) return message.send(lang.commands.dlt.no_quoted);
    return await message.delete(message.quoted);
  },
});

registerCommand({
  name: 'blocklist',
  fromMe: true,
  desc: 'Get all the list of numbers you have blocked',
  type: 'whatsapp',
  function: async (message) => {
    const users = await message.fetchBlocklist();
    if (!users) return message.send(lang.commands.blocklist.no_blocked);
    return await message.send(users.map((nums) => `\n@${nums.split('@')[0]}`).join(''), {
      mentions: users,
    });
  },
});

registerCommand({
  name: 'save',
  fromMe: true,
  desc: 'Save a status by replying to it',
  type: 'whatsapp',
  function: async (message) => {
    if (!message?.quoted?.broadcast) return message.send(lang.commands.save.no_status);
    await message.forward(message.owner, message.quoted, { quoted: message.quoted });
    return message.send(lang.commands.save.successfull);
  },
});
