import { fetchJson, isUrl, Module } from '../index.mts';

Module({
  name: 'url',
  fromMe: false,
  desc: 'Shorten a url',
  type: 'utilities',
  function: async (message, match) => {
    if (!match || !isUrl(match)) return message.send('Provide a url to shorten');
    return await message.send(
      (await fetchJson(`https://tinyurl.com/api-create.php?url=${match}`)).trim(),
    );
  },
});
