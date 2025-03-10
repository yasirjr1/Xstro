import { fetchJson, isUrl, Module, uploadFile } from '../index.mts';

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

Module({
  name: 'upload',
  fromMe: false,
  desc: 'Upload a file',
  type: 'utilities',
  function: async (message) => {
    if (
      !message?.quoted &&
      !message.quoted?.message?.audioMessage &&
      !message.quoted?.message?.imageMessage &&
      !message.quoted?.message?.videoMessage
    )
      return message.send('Reply an image, video or audio message.');
    const media = await message.downloadM(message.quoted, false);
    if (!media) return message.send('Failed to download message');
    const url = await uploadFile(media);
    return await message.send(url!);
  },
});
