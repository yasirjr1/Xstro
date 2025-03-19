import { Module, numToJid } from '../index.mts';

Module({
  name: 'newgc',
  fromMe: true,
  isGroup: false,
  desc: 'Add a user to a Group',
  type: 'group',
  function: async (message, match) => {
    if (!match) {
      return message.send(`Usage: ${message.prefix}newgc MyGroup|1244556`);
    }
    const [groupName, numbers] = match.split('|');

    if (!groupName || !numbers) {
      return message.send('Usage: GroupName|Number1,Number2');
    }
    const participants = numbers.split(',').map((num) => numToJid(num.trim()));
    await message.groupCreate(
      groupName.trim(),
      message.mentions && message.mentions.length > 0 ? message.mentions : participants,
    );
  },
});

Module({
  name: 'kick',
  fromMe: false,
  isGroup: true,
  desc: 'Remove a participant from Group',
  type: 'group',
  function: async (message, match) => {
    if (!(await message.isAdmin())) {
      return message.send('You are not Admin.');
    }
    if (!(await message.isBotAdmin())) {
      return message.send('I am not an Admin.');
    }
    const jid = message.user(match);
    if (!jid) return message.send('tag, reply or provide the user number');
    await message.groupParticipantsUpdate(message.jid, [jid], 'remove');
  },
});

Module({
  name: 'gname',
  fromMe: false,
  isGroup: true,
  desc: 'Update Group Name',
  type: 'group',
  function: async (message, match) => {
    if (!match) {
      return message.send('Provide A New Group Name');
    }
    if (!(await message.isAdmin())) return message.send('Admin only');
    if (!(await message.isBotAdmin())) return message.send('I need to be admin');
    await message.groupUpdateSubject(message.jid, match);
    return message.send('Group Name Update');
  },
});

Module({
  name: 'gdesc',
  fromMe: false,
  isGroup: true,
  desc: 'Update Group Description',
  type: 'group',
  function: async (message, match?: string) => {
    if (!(await message.isAdmin())) return message.send('Admin only');
    if (!(await message.isBotAdmin())) return message.send('I need to be admin');
    await message.groupUpdateDescription(message.jid, match);
    return message.send('Group Description Updated');
  },
});

Module({
  name: 'announce',
  fromMe: false,
  isGroup: true,
  desc: 'Allow only Admins to send messages.',
  type: 'group',
  function: async (message) => {
    if (!(await message.isAdmin())) return message.send('Admin only');
    if (!(await message.isBotAdmin())) return message.send('I need to be admin');
    const metadata = await message.groupMetadata(message.jid);
    if (metadata.announce)
      return message.send('Group settings already allowed only Admins to send messages.');
    await message.groupSettingUpdate(message.jid, 'announcement');
    return await message.send('Group muted, only admins can send messages.');
  },
});

Module({
  name: 'unannounce',
  fromMe: false,
  isGroup: true,
  desc: 'Allow only Admins to send messages.',
  type: 'group',
  function: async (message) => {
    if (!(await message.isAdmin())) return message.send('Admin only');
    if (!(await message.isBotAdmin())) return message.send('I need to be admin');
    const metadata = await message.groupMetadata(message.jid);
    if (!metadata.announce)
      return message.send('Group settings already allowed all members to send messages.');
    await message.groupSettingUpdate(message.jid, 'not_announcement');
    return await message.send('Group muted, all memebers can now send a message.');
  },
});

Module({
  name: 'restrict',
  fromMe: false,
  isGroup: true,
  desc: 'Lock groups setting to be managed by only admins',
  type: 'group',
  function: async (message) => {
    if (!(await message.isAdmin())) return message.send('Admin only');
    if (!(await message.isBotAdmin())) return message.send('I need to be admin');
    const metadata = await message.groupMetadata(message.jid);
    if (metadata.restrict)
      return message.send('Group has already been set to only allow admins manage settings');
    await message.groupSettingUpdate(message.jid, 'locked');
    return await message.send('Group settings updated to only Admins change Settings.');
  },
});

Module({
  name: 'unrestrict',
  fromMe: false,
  isGroup: true,
  desc: 'Unlock groups setting to allow all members to manage settings',
  type: 'group',
  function: async (message) => {
    if (!(await message.isAdmin())) return message.send('Admin only');
    if (!(await message.isBotAdmin())) return message.send('I need to be admin');
    const metadata = await message.groupMetadata(message.jid);
    if (!metadata.restrict)
      return message.send('Group is already set to allow all members manage settings');
    await message.groupSettingUpdate(message.jid, 'unlocked');
    return await message.send('Group settings updated to allow all members to change Settings.');
  },
});

Module({
  name: 'invite',
  fromMe: false,
  isGroup: true,
  desc: 'Get a group invite link',
  type: 'group',
  function: async (message) => {
    if (!(await message.isAdmin())) return message.send('Admin only');
    if (!(await message.isBotAdmin())) return message.send('I need to be admin');
    const code = await message.groupInviteCode(message.jid);
    return await message.send(`https://chat.whatsapp.com/${code}`);
  },
});

Module({
  name: 'revoke',
  fromMe: false,
  isGroup: true,
  desc: 'Revoke group invite code',
  type: 'group',
  function: async (message) => {
    if (!(await message.isAdmin())) return message.send('Admin only');
    if (!(await message.isBotAdmin())) return message.send('I need to be admin');
    const code = await message.groupRevokeInvite(message.jid);
    return await message.send(`Group link reset\n\nhttps://chat.whatsapp.com/${code!}`);
  },
});

Module({
  name: 'approval',
  fromMe: false,
  isGroup: true,
  desc: 'Turn on or off settings for GroupJoinApproval',
  type: 'group',
  function: async (message, match) => {
    if (!match) return message.send(`Usage: ${message.prefix}approval on | off`);
    match = match.toLowerCase().trim();
    if (match === 'on') {
      await message.groupJoinApprovalMode(message.jid, 'on');
      return message.send(`Approval Mode Turned On`);
    }
    if (match === 'off') {
      await message.groupJoinApprovalMode(message.jid, 'off');
      return message.send(`Approval Mode Turned Off`);
    }
  },
});

Module({
  name: 'tag',
  fromMe: false,
  isGroup: true,
  desc: 'Mention everyone in a group without seeing the mentions',
  type: 'group',
  function: async (message, match) => {
    const allmemebers = (await message.groupMetadata(message.jid)).participants;
    const participants = allmemebers
      .filter((participant) => participant.id)
      .map((participant) => participant.id);

    if (!match && !message.quoted) return message.send('Reply or type anything to tag with');

    if (match || message.quoted?.text) {
      return await message.send(message!?.quoted!?.text! ?? match, {
        mentions: [...participants],
      });
    }

    if (message.quoted) {
      return await message.sendMessage(message.jid, {
        forward: message.quoted,
        mentions: [...participants],
      });
    }
  },
});

Module({
  name: 'tagall',
  fromMe: false,
  isGroup: true,
  desc: 'Mention everyone in group',
  type: 'group',
  function: async (message, match) => {
    if (!(await message.isAdmin())) return message.send('Admin only');
    if (!(await message.isBotAdmin())) return message.send('I need to be admin');
    const { participants } = await message.groupMetadata(message.jid);
    if (!participants?.length) return message.send('No participants');
    return message.relayMessage(
      message.jid,
      {
        extendedTextMessage: {
          text: `@${message.jid} ${match ?? ''}`,
          contextInfo: {
            mentionedJid: participants.filter((p) => p.id).map((p) => p.id),
            groupMentions: [{ groupJid: message.jid, groupSubject: 'everyone' }],
          },
        },
      },
      {},
    );
  },
});
