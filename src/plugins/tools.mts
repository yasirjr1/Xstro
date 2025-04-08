import { Command } from '../core/index.ts';
import { fetchJson, isUrl, urlBuffer } from '../utils/requests.ts';

Command({
  name: 'url',
  fromMe: false,
  isGroup: false,
  desc: 'Shorten a url',
  type: 'tools',
  function: async (message, match) => {
    if (!match || !isUrl(match)) return message.send('Provide a url to shorten');
    const url = await fetchJson(`https://tinyurl.com/api-create.php?url=${match}`);
    return await message.send(url);
  },
});

Command({
  name: 'getpp',
  fromMe: false,
  isGroup: false,
  desc: 'Get the profile picture of any person or group',
  type: 'tools',
  function: async (message, match) => {
    const user = message.parseUser(match);
    if (!user) return message.send('Provide someone number');
    const profilePic = await message.profilePictureUrl(user, 'image');
    if (!profilePic)
      return message.send(
        'User has no profile picture, or maybe their settings is prevent the bot from seeing it.',
      );
    return await message.send(await urlBuffer(profilePic));
  },
});
