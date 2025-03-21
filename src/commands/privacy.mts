import { registerCommand } from '../index.mts';
import type {
  WAPrivacyCallValue,
  WAPrivacyGroupAddValue,
  WAPrivacyOnlineValue,
  WAPrivacyValue,
  WAReadReceiptsValue,
} from 'baileys';

registerCommand({
  name: 'callprivacy',
  fromMe: true,
  desc: 'Update Call Privacy',
  type: 'privacy',
  function: async (message, match: WAPrivacyCallValue) => {
    if (
      !match ||
      (match?.toLowerCase().trim() !== 'all' && match?.toLowerCase().trim() !== 'known')
    ) {
      return message.send(`_Usage: ${message.prefix[0]}callprivacy all | known_`);
    }
    await message.updateCallPrivacy(match);
    return await message.send(`_Call Privacy updated to allow ${match} users call you._`);
  },
});

registerCommand({
  name: 'lastseen',
  fromMe: true,
  desc: 'Update Last Seen Privacy',
  type: 'privacy',
  function: async (message, match: WAPrivacyValue) => {
    const opts: WAPrivacyValue[] = ['all', 'contacts', 'contact_blacklist', 'none'];
    if (!match || !opts.includes(match.toLowerCase().trim() as WAPrivacyValue)) {
      return message.send(`_Usage: ${message.prefix[0]}lastseen ${opts.join(' | ')}_`);
    }
    const privacySetting = match.toLowerCase().trim() as WAPrivacyValue;
    await message.updateLastSeenPrivacy(privacySetting);
    return message.send(`_Updated LastSeen settings for ${privacySetting} users._`);
  },
});

registerCommand({
  name: 'online',
  fromMe: true,
  desc: 'Update Online Status Privacy',
  type: 'privacy',
  function: async (message, match: string) => {
    const options = ['on', 'lastseen'];
    const internalMapping: Record<string, WAPrivacyOnlineValue> = {
      on: 'all',
      lastseen: 'match_last_seen',
    };
    if (!match || !options.includes(match.toLowerCase().trim())) {
      return message.send(`_Usage: ${message.prefix[0]}online ${options.join(' | ')}_`);
    }
    const userInput = match.toLowerCase().trim();
    const privacySetting = internalMapping[userInput];
    await message.updateOnlinePrivacy(privacySetting);
    return message.send(`_Updated Online Privacy settings to ${userInput}_`);
  },
});

registerCommand({
  name: 'bluetick',
  fromMe: true,
  desc: 'Read Recipts Settings',
  type: 'privacy',
  function: async (message, match: WAReadReceiptsValue) => {
    const Settings: Record<string, WAReadReceiptsValue> = {
      on: 'all',
      off: 'none',
    };
    if (!match || (match?.toLowerCase().trim() !== 'on' && match?.toLowerCase().trim() !== 'off'))
      return message.send(`_Usage: ${message.prefix[0]}bluetick on | off_`);
    const option = match.toLowerCase().trim();
    const privacySetting = Settings[option];
    await message.updateReadReceiptsPrivacy(privacySetting);
    return message.send(`_Blueticks are now ${match}_`);
  },
});

registerCommand({
  name: 'groupadd',
  fromMe: true,
  desc: 'Update Group Add Privacy',
  type: 'privacy',
  function: async (message, match: WAPrivacyGroupAddValue) => {
    const opts: WAPrivacyGroupAddValue[] = ['all', 'contacts', 'contact_blacklist'];
    if (!match || !opts.includes(match.toLowerCase().trim() as WAPrivacyGroupAddValue)) {
      return message.send(`_Usage: ${message.prefix[0]}groupaddprivacy ${opts.join(' | ')}_`);
    }
    const privacySetting = match.toLowerCase().trim() as WAPrivacyGroupAddValue;
    await message.updateGroupsAddPrivacy(privacySetting);
    return message.send(`_Updated Group Add Privacy to ${privacySetting}_`);
  },
});
