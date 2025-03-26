import { registerCommand } from './_registers.mts';
import {
  convertToMp3,
  toPTT,
  toVideo,
  audioToBlackVideo,
  flipMedia,
  cropToCircle,
  createSticker,
  trimVideo,
} from '../src/index.mts';

registerCommand({
  name: 'ptt',
  fromMe: false,
  desc: 'Convert any video or audio to push to talk ogg audio with waves',
  type: 'media',
  function: async (message) => {
    if (!message?.quoted?.message?.audioMessage && !message?.quoted?.message?.videoMessage)
      return message.send('Reply a video or audio message');
    const media = await message.downloadM(message.quoted!, false);
    if (!media || !Buffer.isBuffer(media)) return message.send('Failed to download message');
    const newAudio = await toPTT(media);
    return await message.sendMessage(message.jid, {
      audio: newAudio,
      ptt: true,
      mimetype: 'audio/ogg; codecs=opus',
    });
  },
});

registerCommand({
  name: 'mp3',
  fromMe: false,
  desc: 'Convert any video or audio to mpeg3 audio',
  type: 'media',
  function: async (message) => {
    if (!message?.quoted?.message?.audioMessage && !message?.quoted?.message?.videoMessage)
      return message.send('Reply a video or audio message');
    const media = await message.downloadM(message.quoted!, false);
    if (!media || !Buffer.isBuffer(media)) return message.send('Failed to download message');
    const mp3 = await convertToMp3(media);
    return await message.sendMessage(message.jid, {
      audio: mp3,
      ptt: false,
      mimetype: 'audio/mpeg',
    });
  },
});

registerCommand({
  name: 'mp4',
  fromMe: false,
  desc: 'Convert any missing or damnaged video to stable video',
  type: 'media',
  function: async (message) => {
    if (!message?.quoted?.message?.videoMessage) return message.send('Reply a video message');
    const media = await message.downloadM(message.quoted!, false);
    if (!media || !Buffer.isBuffer(media)) return message.send('Failed to download message');
    const video = await toVideo(media);
    return await message.sendMessage(message.jid, { video: video, mimetype: '	video/mp4' });
  },
});

registerCommand({
  name: 'black',
  fromMe: false,
  desc: 'Convert audio to video with black background',
  type: 'media',
  function: async (message) => {
    if (!message?.quoted?.message?.audioMessage) return message.send('Reply to an audio message');
    const media = await message.downloadM(message.quoted!, false);
    if (!media || !Buffer.isBuffer(media)) return message.send('Failed to download message');
    const video = await audioToBlackVideo(media);
    return await message.sendMessage(message.jid, {
      video: video,
      mimetype: 'video/mp4',
    });
  },
});

registerCommand({
  name: 'flip',
  fromMe: false,
  desc: 'Flip video/image (left/right/vertical/horizontal)',
  type: 'media',
  function: async (message, args) => {
    if (!message?.quoted?.message?.videoMessage && !message?.quoted?.message?.imageMessage)
      return message.send('Reply to a video or image message');
    const choice = args?.toLowerCase();
    const directions = ['left', 'right', 'vertical', 'horizontal'];
    if (!choice || !directions.includes(choice))
      return message.send('Specify direction: left, right, vertical, or horizontal');
    const media = await message.downloadM(message.quoted!, false);
    if (!media || !Buffer.isBuffer(media)) return message.send('Failed to download message');
    const flipped = await flipMedia(media, choice);
    return await message.send(flipped);
  },
});

registerCommand({
  name: 'circle',
  fromMe: false,
  desc: 'Crop image to circular shape',
  type: 'media',
  function: async (message) => {
    if (!message?.quoted?.message?.imageMessage) return message.send('Reply to an image message');
    const media = await message.downloadM(message.quoted!, false);
    if (!media || !Buffer.isBuffer(media)) return message.send('Failed to download message');
    const circular = await cropToCircle(media);
    return await message.sendMessage(message.jid, {
      image: circular,
      mimetype: 'image/webp',
    });
  },
});

registerCommand({
  name: 'sticker',
  fromMe: false,
  desc: 'Convert image/video to sticker with optional metadata',
  type: 'media',
  function: async (message, args) => {
    if (
      !message?.quoted?.message?.imageMessage &&
      !message?.quoted?.message?.videoMessage &&
      !message?.quoted?.message?.stickerMessage
    )
      return message.send('Reply to an image, video or sticker message');
    const media = await message.downloadM(message.quoted!, false);
    if (!media || !Buffer.isBuffer(media)) return message.send('Failed to download message');

    let packname, author;

    if (args) {
      [packname, author] = args.split('|');
    }
    const sticker = await createSticker(
      media,
      author?.trim() || 'Astro',
      packname?.trim() || 'Xstro',
    );
    return await message.sendMessage(message.jid, {
      sticker: sticker,
      mimetype: 'image/webp',
    });
  },
});

registerCommand({
  name: 'trim',
  fromMe: false,
  desc: 'Trim a video message, by providing a new start and end time',
  type: 'media',
  function: async (message, match) => {
    if (!message.quoted || !message.quoted?.message?.videoMessage)
      return message.send('Reply to a video Message');
    if (!match) return message.send(`Usage:\n${message.prefix}trim 00:00:05|00:01:08`);
    const videotoTrim = await message.downloadM(message.quoted);
    if (!videotoTrim || !Buffer.isBuffer(videotoTrim)) return;
    const [startTime, endTime] = match.split('|');
    if (!startTime || !endTime)
      return message.send(`Usage:\n${message.prefix}trim 00:00:05|00:01:08`);
    const trimmedVideo = await trimVideo(videotoTrim, startTime, endTime);
    return await message.send(trimmedVideo);
  },
});
