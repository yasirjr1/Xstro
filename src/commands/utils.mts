import { fetchJson, isUrl, Module, numToJid, uploadFile, urlBuffer } from '../index.mts';

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

Module({
  name: 'getpp',
  fromMe: false,
  desc: 'Get the profile picture of any person or group',
  type: 'utilities',
  function: async (message, match) => {
    const user = message.user(match);
    if (!user) return message.send('Provide someone number');
    const profilePic = await message.profilePictureUrl(user, 'image');
    if (!profilePic)
      return message.send(
        'User has no profile picture, or maybe their settings is prevent the bot from seeing it.',
      );
    return await message.send(await urlBuffer(profilePic));
  },
});

Module({
  name: 'userinfo',
  fromMe: false,
  desc: 'Get details about a user',
  type: 'utilities',
  function: async (message, match) => {
    const user = message.user(match);
    if (!user) return message.send('Provide a user number to get their info');
    const bio_details = await message.fetchStatus(user).catch(() => null);
    const profile_image = await message.profilePictureUrl(user, 'image').catch(() => null);

    const Info = (bio_details as unknown as { status: { status: string; setAt: string } }[])?.[0];
    const bio_text = Info?.status?.status ?? 'No bio available';
    const date = Info?.status?.setAt ? new Date(Info.status.setAt) : null;

    const setBio =
      date instanceof Date && !isNaN(date.getTime())
        ? new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }).format(date)
        : 'Unknown';

    const caption = `Bio: ${bio_text}\nSet At: ${setBio}`;
    return profile_image
      ? await message.send(await urlBuffer(profile_image), { caption })
      : await message.send(caption);
  },
});

Module({
  name: 'forward',
  fromMe: true,
  desc: 'Forward any message to someone',
  type: 'utilities',
  function: async (message, match) => {
    if (!match) return message.send('Please provide a user number to forward the message to!');
    const jid = numToJid(match.trim());
    if (!(await message.onWhatsApp(jid))?.[0]?.exists)
      return message.send('The provided WhatsApp number seems to be invalid');
    if (!message.quoted) return message.send('Please reply to a message to forward it!');
    await message.forward(jid, message.quoted, { quoted: message.quoted });
    return message.send('Message forwarded successfully');
  },
});
